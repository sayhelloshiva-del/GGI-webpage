import { z } from 'zod';

import { TRACK_IDS } from '@/data/tracks';
import { MATCHER_QUESTIONS, optionIdsFor } from '@/data/matcher';

/**
 * What the browser is allowed to send us.
 *
 * Answers are validated against the known option ids rather than accepted as
 * free text, so nothing user-supplied ever reaches the model prompt.
 */
export const TrackMatchRequestSchema = z.object({
  answers: z
    .array(z.string())
    .length(MATCHER_QUESTIONS.length)
    .refine(
      (answers) => answers.every((answer, i) => optionIdsFor(i).includes(answer)),
      { message: 'One or more answers are not valid options for their question.' },
    ),
});

export type TrackMatchRequest = z.infer<typeof TrackMatchRequestSchema>;

/**
 * The shape the model is asked to return, and the shape we re-validate against
 * before anything is trusted. Raw model output is never used directly.
 */
export const TrackMatchSchema = z.object({
  trackId: z.enum(TRACK_IDS),
  trackName: z.string().min(1).max(120),
  confidence: z.number().min(0).max(100),
  reason: z.string().min(1).max(600),
});

export type TrackMatch = z.infer<typeof TrackMatchSchema>;

/** Why the result was produced locally instead of by the model. */
export const FallbackReasonSchema = z.enum([
  'AI_OFFLINE',
  'AI_TIMEOUT',
  'AI_INVALID',
  'AI_REFUSED',
  'AI_ERROR',
]);

export type FallbackReason = z.infer<typeof FallbackReasonSchema>;

/** What the API returns. `source` tells the UI which state to render. */
export const TrackMatchResponseSchema = TrackMatchSchema.extend({
  source: z.enum(['ai', 'local']),
  fallbackReason: FallbackReasonSchema.optional(),
});

export type TrackMatchResponse = z.infer<typeof TrackMatchResponseSchema>;
