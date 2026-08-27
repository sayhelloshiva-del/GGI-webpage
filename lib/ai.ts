import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

import { getOption, MATCHER_QUESTIONS } from '@/data/matcher';
import { getTrack, TRACKS } from '@/data/tracks';
import { rankTracks } from '@/lib/track-scoring';
import { TrackMatchSchema, type FallbackReason, type TrackMatch } from '@/lib/schemas';

const DEFAULT_MODEL = 'claude-opus-5';
const DEFAULT_TIMEOUT_MS = 9_000;

/** Any failure that should hand over to the deterministic scorer. */
export class AiFallbackError extends Error {
  constructor(
    readonly reason: FallbackReason,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiFallbackError';
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
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
  'You are given one delegate\'s three answers and a deterministic ranking produced',
  'by the summit\'s own scoring rules. Usually confirm the top-ranked track. Choose a',
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
 * Ask the model for a track match.
 *
 * Throws `AiFallbackError` for every failure mode — no key, provider down,
 * timeout, refusal, or output that does not survive schema validation — so the
 * caller has exactly one thing to catch before falling back to local scoring.
 */
export async function matchTrackWithAi(answers: readonly string[]): Promise<TrackMatch> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiFallbackError('AI_OFFLINE', 'ANTHROPIC_API_KEY is not set.');
  }

  const client = new Anthropic({ apiKey, maxRetries: 1 });

  let response;
  try {
    response = await client.messages.parse(
      {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserMessage(answers) }],
        output_config: {
          effort: 'low',
          format: zodOutputFormat(TrackMatchSchema),
        },
      },
      { timeout: aiTimeoutMs() },
    );
  } catch (error) {
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      throw new AiFallbackError('AI_TIMEOUT', 'The model took too long.', error);
    }
    if (error instanceof Anthropic.APIConnectionError) {
      throw new AiFallbackError('AI_OFFLINE', 'Could not reach the model provider.', error);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      throw new AiFallbackError('AI_OFFLINE', 'The API key was rejected.', error);
    }
    throw new AiFallbackError('AI_ERROR', 'The model request failed.', error);
  }

  if (response.stop_reason === 'refusal') {
    throw new AiFallbackError('AI_REFUSED', 'The model declined the request.');
  }

  // Never trust the parsed output on the SDK's word alone — re-validate it,
  // then rebuild the record from our own data so a hallucinated track name
  // can never reach the page.
  const parsed = TrackMatchSchema.safeParse(response.parsed_output);
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
