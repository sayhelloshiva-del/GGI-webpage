import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

import { getOption, MATCHER_QUESTIONS } from '@/data/matcher';
import { getTrack, TRACKS } from '@/data/tracks';
import { rankTracks } from '@/lib/track-scoring';
import { TrackMatchSchema, type FallbackReason, type TrackMatch } from '@/lib/schemas';

// Flash-Lite: the task is a six-way classification with a short sentence back,
// and this tier answers in ~3.5s against a 9s deadline. Measured alternatives:
// 3.7-flash caps at 20 free requests, 3.5-flash took 12.5s and would miss the
// deadline outright.
const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_TIMEOUT_MS = 9_000;

/**
 * The model is asked for the track and its reasoning only. trackName is
 * rebuilt from our own data afterwards, so it is not worth a round trip.
 */
const ModelOutputSchema = TrackMatchSchema.omit({ trackName: true });

/** Any failure that should hand over to the deterministic scorer. */
export class AiFallbackError extends Error {
  constructor(
    readonly reason: FallbackReason,
    message: string,
    readonly cause?: unknown,
    /** Provider status and message, for logs. Never contains the API key. */
    readonly detail?: string,
  ) {
    super(message);
    this.name = 'AiFallbackError';
  }
}

/** The provider's own status and message, trimmed and stripped of any key. */
function describe(error: unknown): string {
  const name = error instanceof Error ? error.name : typeof error;
  const status = (error as { status?: unknown })?.status;
  const body = String((error as { body?: unknown })?.body ?? '');
  const message = String((error as { message?: unknown })?.message ?? '');
  const text = (body || message)
    .replace(/AIza[\w-]{10,}/g, '[redacted]')
    .replace(/\s+/g, ' ');
  return `${name}${status ? ` ${status}` : ''}: ${text.slice(0, 300)}`;
}

function apiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export function isAiConfigured(): boolean {
  return Boolean(apiKey());
}

export function aiTimeoutMs(): number {
  const parsed = Number(process.env.TRACK_MATCH_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

const SYSTEM_PROMPT = [
  'You allocate delegates to working tracks at the Global Graduate Summit 2027,',
  'a two-day summit in London for 500 Indian students and graduates aged 18 to 28.',
  '',
  'There are exactly six tracks:',
  ...TRACKS.map((track) => `${track.id} — ${track.fullName}: ${track.body}`),
  '',
  "You are given one delegate's three answers and a deterministic ranking produced",
  "by the summit's own scoring rules. Usually confirm the top-ranked track. Choose a",
  'different track only when the answers clearly justify it.',
  '',
  'Write the reason in the second person, as one or two plain sentences, addressed',
  'to the delegate. No preamble, no bullet points, no restating the question.',
  'Confidence is an integer from 0 to 100 reflecting how cleanly the answers point',
  'at one track.',
].join('\n');

function buildUserMessage(answers: readonly string[]): string {
  const lines = MATCHER_QUESTIONS.map((question, index) => {
    const answerId = answers[index];
    const label = answerId ? getOption(answerId)?.label : undefined;
    return `Q${question.index}: ${question.prompt}\nA: ${label ?? 'no answer'}`;
  });

  const ranking = rankTracks(answers)
    .map(([trackId, score]) => `${trackId} ${getTrack(trackId)?.fullName ?? ''} — ${score.toFixed(2)}`)
    .join('\n');

  return `${lines.join('\n\n')}\n\nDeterministic ranking (highest first):\n${ranking}`;
}

/**
 * Transport failures are told apart by name and HTTP status rather than by
 * instanceof: the SDK throws BadRequestError, RequestTimeoutError and friends,
 * and none of them are exported or extend the exported ApiError.
 */
function classify(error: unknown): FallbackReason {
  // Matched on the pattern, not exact names: the type declarations list
  // RequestTimeoutError/ConnectionError but the runtime throws
  // APIConnectionTimeoutError/APIConnectionError. Timeout is tested first
  // because the timeout class name contains "connection" too.
  const name = error instanceof Error ? error.name : '';
  if (/timeout|abort/i.test(name)) return 'AI_TIMEOUT';
  if (/connection|network|fetch/i.test(name)) return 'AI_OFFLINE';

  const status = Number((error as { status?: unknown })?.status);
  const body = String((error as { body?: unknown })?.body ?? '');

  // A rejected key comes back as 400 INVALID_ARGUMENT / API_KEY_INVALID, not
  // 401, so a bare status check would report it as a generic failure.
  if (status === 401 || status === 403) return 'AI_OFFLINE';
  if (status === 400 && /API_KEY_INVALID|API key not valid/i.test(body)) return 'AI_OFFLINE';

  return 'AI_ERROR';
}

/**
 * Ask the model to confirm a track allocation.
 *
 * Throws `AiFallbackError` for every failure mode — no key, provider down,
 * timeout, refusal, or output that does not survive schema validation — so the
 * caller has exactly one thing to catch before falling back to local scoring.
 */
export async function matchTrackWithAi(answers: readonly string[]): Promise<TrackMatch> {
  const key = apiKey();
  if (!key) {
    throw new AiFallbackError('AI_OFFLINE', 'GEMINI_API_KEY is not set.');
  }

  const client = new GoogleGenAI({ apiKey: key });

  let text: string | undefined;
  try {
    const interaction = await client.interactions.create(
      {
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        system_instruction: SYSTEM_PROMPT,
        input: buildUserMessage(answers),
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: z.toJSONSchema(ModelOutputSchema) as Record<string, unknown>,
        },
      },
      // No retry: on a free-tier 429 a second attempt burns the same quota and
      // pushes past the deadline. Local scoring is the better answer.
      { timeout: aiTimeoutMs(), maxRetries: 0 },
    );

    text = 'output_text' in interaction ? interaction.output_text : undefined;
  } catch (error) {
    throw new AiFallbackError(
      classify(error),
      'The model request failed.',
      error,
      describe(error),
    );
  }

  // Empty output means the model produced nothing usable — a safety stop, or a
  // response with no text part. Either way there is nothing to validate.
  if (!text) {
    throw new AiFallbackError('AI_REFUSED', 'The model returned no output.');
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new AiFallbackError('AI_INVALID', 'The model did not return JSON.', error);
  }

  // Never trust the output on the schema's word alone — re-validate it, then
  // rebuild the record from our own data so a hallucinated track name can
  // never reach the page.
  const parsed = ModelOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AiFallbackError('AI_INVALID', 'The model returned a response we could not use.');
  }

  const track = getTrack(parsed.data.trackId);
  if (!track) {
    throw new AiFallbackError('AI_INVALID', 'The model returned an unknown track.');
  }

  return {
    trackId: track.id,
    trackName: track.fullName,
    confidence: Math.round(Math.min(100, Math.max(0, parsed.data.confidence))),
    reason: parsed.data.reason.trim(),
  };
}
