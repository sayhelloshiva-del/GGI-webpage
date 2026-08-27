'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MATCHER_QUESTIONS } from '@/data/matcher';
import { getTrack } from '@/data/tracks';
import { TrackMatchResponseSchema, type FallbackReason, type TrackMatch } from '@/lib/schemas';
import { matchLocally, runnerUp } from '@/lib/track-scoring';
import { SectionHead } from '@/components/section-head';
import { Headline } from '@/components/headline';

import styles from './track-matcher.module.css';

/** Explicit states. Every one of them is a designed screen. */
type Phase = 'IDLE' | 'QUESTION' | 'SUBMITTING' | 'SLOW' | 'SUCCESS' | 'FALLBACK' | 'ERROR';

/** How long before we tell the user the model is being slow. */
const SLOW_AFTER_MS = 4_000;
/** How long before the browser stops waiting and scores the answers itself. */
const CLIENT_TIMEOUT_MS = 14_000;

const FALLBACK_COPY: Record<FallbackReason, { title: string; body: string }> = {
  AI_TIMEOUT: {
    title: 'The AI took too long.',
    body: "We've matched you using our local track scoring instead.",
  },
  AI_OFFLINE: {
    title: 'AI currently offline',
    body: "No problem — we've matched your answers using the summit's track rules.",
  },
  AI_INVALID: {
    title: "The AI sent back something we couldn't use.",
    body: "We've matched you using our local track scoring instead.",
  },
  AI_REFUSED: {
    title: 'The AI declined to answer.',
    body: "No problem — we've matched your answers using the summit's track rules.",
  },
  AI_ERROR: {
    title: 'The AI is having a moment.',
    body: "No problem — we've matched your answers using the summit's track rules.",
  },
};

export function TrackMatcher() {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<TrackMatch | null>(null);
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(null);

  const questionRef = useRef<HTMLParagraphElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const controller = useRef<AbortController | null>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      controller.current?.abort();
    },
    [clearTimers],
  );

  const submit = useCallback(
    async (finalAnswers: string[]) => {
      setPhase('SUBMITTING');
      clearTimers();

      const abort = new AbortController();
      controller.current = abort;

      timers.current.push(
        window.setTimeout(() => setPhase((p) => (p === 'SUBMITTING' ? 'SLOW' : p)), SLOW_AFTER_MS),
        window.setTimeout(() => abort.abort(), CLIENT_TIMEOUT_MS),
      );

      const localFallback = (reason: FallbackReason) => {
        try {
          setResult(matchLocally(finalAnswers));
          setFallbackReason(reason);
          setPhase('FALLBACK');
        } catch {
          setPhase('ERROR');
        }
      };

      try {
        const response = await fetch('/api/track-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: finalAnswers }),
          signal: abort.signal,
        });

        if (!response.ok) {
          localFallback('AI_ERROR');
          return;
        }

        // The API's own output is validated too — a good response shape is
        // never assumed just because the status code was 200.
        const parsed = TrackMatchResponseSchema.safeParse(await response.json());
        if (!parsed.success) {
          localFallback('AI_INVALID');
          return;
        }

        const { source, fallbackReason: reason, ...match } = parsed.data;
        setResult(match);

        if (source === 'ai') {
          setFallbackReason(null);
          setPhase('SUCCESS');
        } else {
          setFallbackReason(reason ?? 'AI_ERROR');
          setPhase('FALLBACK');
        }
      } catch (error) {
        const aborted = error instanceof DOMException && error.name === 'AbortError';
        localFallback(aborted ? 'AI_TIMEOUT' : 'AI_OFFLINE');
      } finally {
        clearTimers();
        controller.current = null;
      }
    },
    [clearTimers],
  );

  const choose = useCallback(
    (optionId: string) => {
      const next = [...answers.slice(0, step), optionId];
      setAnswers(next);

      if (next.length < MATCHER_QUESTIONS.length) {
        setStep(next.length);
        window.setTimeout(() => questionRef.current?.focus(), 30);
      } else {
        void submit(next);
      }
    },
    [answers, step, submit],
  );

  const back = useCallback(() => {
    setStep((current) => Math.max(0, current - 1));
    window.setTimeout(() => questionRef.current?.focus(), 30);
  }, []);

  const restart = useCallback(() => {
    clearTimers();
    controller.current?.abort();
    setAnswers([]);
    setStep(0);
    setResult(null);
    setFallbackReason(null);
    setPhase('QUESTION');
    window.setTimeout(() => questionRef.current?.focus(), 30);
  }, [clearTimers]);

  useEffect(() => {
    if (phase === 'SUCCESS' || phase === 'FALLBACK') {
      resultRef.current?.focus();
    }
  }, [phase]);

  const question = MATCHER_QUESTIONS[step];
  const matchedTrack = result ? getTrack(result.trackId) : undefined;
  const second = result ? runnerUp(answers) : undefined;

  return (
    <section id="matcher" className={`tone-ink section ${styles.section}`}>
      <div className="shell inner">
        <SectionHead index="03" label="Track matcher">
          <Headline
            className="d1"
            lines={[
              <>
                Not sure which <span className="gradientText">room</span>
              </>,
              'you belong in?',
            ]}
          />
          <p className="body">Answer three questions. We&rsquo;ll match you to a track.</p>
        </SectionHead>

        <div className={`frame ${styles.panel}`}>
          <div className={styles.panelHead}>
            <span className="meta meta--orange">GGS.27 / allocation tool</span>
            <span className="meta">
              {phase === 'QUESTION' && question
                ? `Q ${question.index} / ${String(MATCHER_QUESTIONS.length).padStart(2, '0')}`
                : 'Three questions'}
            </span>
          </div>

          <div className={styles.stage} aria-live="polite">
            {phase === 'IDLE' ? (
              <div className={styles.idle}>
                <p className={`display ${styles.idleTitle}`}>
                  Three questions.
                  <br />
                  One allocation.
                </p>
                <p className={styles.idleBody}>
                  This is the same scoring the programme committee uses as a first pass. It
                  is a suggestion, not your final allocation.
                </p>
                <button type="button" className="btn btnPrimary" onClick={restart}>
                  Start <span className="arrow" aria-hidden="true">→</span>
                </button>
              </div>
            ) : null}

            {phase === 'QUESTION' && question ? (
              <div className={styles.question}>
                <div className={styles.progress} aria-hidden="true">
                  {MATCHER_QUESTIONS.map((item, index) => (
                    <span
                      key={item.id}
                      className={index <= step ? styles.progressOn : styles.progressOff}
                    />
                  ))}
                </div>

                <p
                  ref={questionRef}
                  tabIndex={-1}
                  id={`matcher-${question.id}`}
                  className={`display ${styles.prompt}`}
                >
                  {question.prompt}
                </p>

                <div className={styles.options} role="group" aria-labelledby={`matcher-${question.id}`}>
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={[
                        styles.option,
                        answers[step] === option.id ? styles.optionActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => choose(option.id)}
                    >
                      <span aria-hidden="true" className={styles.optionMark} />
                      {option.label}
                    </button>
                  ))}
                </div>

                {step > 0 ? (
                  <button type="button" className={styles.back} onClick={back}>
                    ← Previous question
                  </button>
                ) : null}
              </div>
            ) : null}

            {phase === 'SUBMITTING' || phase === 'SLOW' ? (
              <div className={styles.working}>
                <span className={styles.pulse} aria-hidden="true" />
                <p className={`display ${styles.workingTitle}`}>
                  {phase === 'SLOW' ? (
                    <>
                      Still working.
                      <br />
                      The model is taking longer than usual.
                    </>
                  ) : (
                    'Matching your answers…'
                  )}
                </p>
                <p className={styles.workingBody}>
                  {phase === 'SLOW'
                    ? 'Give it a moment. If it does not come back we will score your answers here instead.'
                    : 'Reading your three answers against the six tracks.'}
                </p>
              </div>
            ) : null}

            {(phase === 'SUCCESS' || phase === 'FALLBACK') && result && matchedTrack ? (
              <div className={styles.result} ref={resultRef} tabIndex={-1}>
                {phase === 'FALLBACK' && fallbackReason ? (
                  <div className={styles.notice}>
                    <p className={`display ${styles.noticeTitle}`}>
                      {FALLBACK_COPY[fallbackReason].title}
                    </p>
                    <p className={styles.noticeBody}>{FALLBACK_COPY[fallbackReason].body}</p>
                  </div>
                ) : null}

                <span className="meta">Your allocation — suggested</span>

                <div className={styles.resultHead}>
                  <span className={`display display--black ${styles.resultNumber}`}>
                    {result.trackId}
                  </span>
                  <span className={`display ${styles.resultName}`}>{result.trackName}</span>
                </div>

                <div className={styles.confidence}>
                  <div className={styles.confidenceMeta}>
                    <span className="meta">Confidence</span>
                    <span className="meta meta--fg">{result.confidence}%</span>
                  </div>
                  <div className={styles.bar}>
                    <span
                      className={styles.barFill}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                <p className={styles.reason}>{result.reason}</p>

                <dl className={styles.resultMeta}>
                  <div>
                    <dt className="meta">Matched by</dt>
                    <dd className="meta meta--fg">
                      {phase === 'SUCCESS' ? 'AI + track rules' : 'Track rules (local)'}
                    </dd>
                  </div>
                  {second ? (
                    <div>
                      <dt className="meta">Second closest</dt>
                      <dd className="meta meta--fg">
                        Track {second} — {getTrack(second)?.fullName}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className={styles.resultActions}>
                  <a className="btn btnPrimary" href="#apply">
                    Apply with this track <span className="arrow" aria-hidden="true">→</span>
                  </a>
                  <button type="button" className="btn btnGhost" onClick={restart}>
                    Start again
                  </button>
                </div>
              </div>
            ) : null}

            {phase === 'ERROR' ? (
              <div className={styles.result}>
                <p className={`display ${styles.noticeTitle}`}>Something went wrong.</p>
                <p className={styles.workingBody}>
                  We couldn&rsquo;t score those answers. Try again, or skip straight to the
                  six tracks and pick the one you would argue hardest for.
                </p>
                <div className={styles.resultActions}>
                  <button type="button" className="btn btnPrimary" onClick={restart}>
                    Try again
                  </button>
                  <a className="btn btnGhost" href="#tracks">
                    See the six tracks
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
