import { getOption, MATCHER_QUESTIONS } from '@/data/matcher';
import { getTrack, TRACKS } from '@/data/tracks';
import type { TrackMatch } from '@/lib/schemas';

/**
 * Deterministic track scoring.
 *
 * This is the summit's own allocation logic, not a degraded mode. It runs on
 * the server when the model is unavailable, and in the browser if the network
 * request itself never completes — so the matcher always has an answer.
 */

export type ScoreTable = Record<string, number>;

const MAX_SINGLE_QUESTION_WEIGHT = MATCHER_QUESTIONS.map((question) =>
  Math.max(...question.options.map((option) => Math.max(...Object.values(option.weights)))),
).reduce((total, weight) => total + weight, 0);

export function scoreAnswers(answers: readonly string[]): ScoreTable {
  const scores: ScoreTable = Object.fromEntries(TRACKS.map((track) => [track.id, 0]));

  answers.forEach((answerId) => {
    const option = getOption(answerId);
    if (!option) return;
    for (const [trackId, weight] of Object.entries(option.weights)) {
      if (trackId in scores) {
        scores[trackId] = (scores[trackId] ?? 0) + weight;
      }
    }
  });

  return scores;
}

/** Sorted best-first. Ties resolve by track number so results are repeatable. */
export function rankTracks(answers: readonly string[]): Array<[string, number]> {
  const scores = scoreAnswers(answers);
  return Object.entries(scores).sort(
    ([idA, scoreA], [idB, scoreB]) => scoreB - scoreA || Number(idA) - Number(idB),
  );
}

/**
 * Confidence is the winner's share of the points it could have taken, nudged by
 * how far clear of second place it finished. Clamped so it never reads as
 * absolute certainty or as a coin toss.
 */
function confidenceFrom(ranked: Array<[string, number]>): number {
  const [first, second] = ranked;
  if (!first) return 50;

  const share = first[1] / MAX_SINGLE_QUESTION_WEIGHT;
  const margin = second ? (first[1] - second[1]) / Math.max(first[1], 1) : 1;
  const raw = share * 70 + margin * 30;

  return Math.round(Math.min(94, Math.max(52, raw)));
}

function reasonFor(trackId: string, answers: readonly string[]): string {
  const track = getTrack(trackId);
  if (!track) return 'Your answers point to this track.';

  // Labels are used verbatim — no case surgery, so proper nouns stay intact.
  const chosen = answers
    .map((id) => getOption(id)?.label)
    .filter((label): label is string => Boolean(label))
    .map((label) => `“${label}”`);

  const list =
    chosen.length > 1
      ? `${chosen.slice(0, -1).join(', ')} and ${chosen[chosen.length - 1]}`
      : (chosen[0] ?? 'your answers');

  return `You chose ${list}. Track ${track.id} is where those land — ${track.question} ${track.output}`;
}

/** Produce a complete, schema-shaped match without calling any model. */
export function matchLocally(answers: readonly string[]): TrackMatch {
  const ranked = rankTracks(answers);
  const winnerId = ranked[0]?.[0] ?? TRACKS[0]!.id;
  const track = getTrack(winnerId) ?? TRACKS[0]!;

  return {
    trackId: track.id,
    trackName: track.fullName,
    confidence: confidenceFrom(ranked),
    reason: reasonFor(track.id, answers),
  };
}

/** The runner-up, shown alongside the result as the delegate's second choice. */
export function runnerUp(answers: readonly string[]): string | undefined {
  return rankTracks(answers)[1]?.[0];
}
