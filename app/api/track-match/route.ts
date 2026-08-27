import { NextResponse } from 'next/server';

import { AiFallbackError, isAiConfigured, matchTrackWithAi } from '@/lib/ai';
import { TrackMatchRequestSchema, type TrackMatchResponse } from '@/lib/schemas';
import { matchLocally } from '@/lib/track-scoring';

export const runtime = 'nodejs';
/** The answers are the whole input — there is nothing to cache. */
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const parsed = TrackMatchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Send three answers, each a valid option id.' },
      { status: 400 },
    );
  }

  const { answers } = parsed.data;

  // No key configured: skip the round trip entirely and say so plainly.
  if (!isAiConfigured()) {
    return respond({ ...matchLocally(answers), source: 'local', fallbackReason: 'AI_OFFLINE' });
  }

  try {
    return respond({ ...(await matchTrackWithAi(answers)), source: 'ai' });
  } catch (error) {
    const reason = error instanceof AiFallbackError ? error.reason : 'AI_ERROR';
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[track-match] falling back to local scoring (${reason})`);
    }
    return respond({ ...matchLocally(answers), source: 'local', fallbackReason: reason });
  }
}

function respond(payload: TrackMatchResponse): NextResponse {
  return NextResponse.json(payload, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
