import { useEffect, useRef, useState } from 'react';
import { identify, track } from '../../lib/analytics/client';
import { CTA_LABEL, OFFER_LINE } from '../../lib/cta';
import { createUser } from '../../lib/signup/api';
import { messageFor } from '../../lib/signup/messages';
import { isAllowedEmail } from '../../lib/users/email';
import ProfileStep, { FieldError } from './ProfileStep';
import ProofCounter from './ProofCounter';

type Phase = 'form' | 'submitting' | 'profile' | 'saving' | 'done';
interface FormError {
  code: string;
  /** Where it came from: a field rule, or the request itself. */
  source: 'client' | 'server' | 'request';
  status?: number | null;
}

// Module-level: each fires once per page load, even if the island mounts twice (StrictMode).
let viewedFired = false;
let startedFired = false;

/** empty, then a mistyped address, then a domain we don't accept. */
function validate(input: HTMLInputElement): string | null {
  const value = input.value.trim();
  if (!value) return 'required';
  if (input.validity.typeMismatch) return 'invalid_email';
  if (!isAllowedEmail(value)) return 'email_not_allowed';
  return null;
}

export default function SignupForm({ variant }: { variant: 'control' | 'counter' }) {
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState<FormError | null>(null);
  const [googleNote, setGoogleNote] = useState(false);
  const [live, setLive] = useState('');
  const [userId, setUserId] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(0);
  const attemptN = useRef(0);
  const lastTracked = useRef<string | null>(null);
  // After a retryable failure, a retry with the same email reuses the first time_to_submit_ms, so
  // the body stays byte-identical and the Idempotency-Key can be reused (lib/signup/api.ts).
  const pending = useRef<{ email: string; ms: number } | null>(null);

  useEffect(() => {
    mountedAt.current = performance.now();
    if (!viewedFired) {
      viewedFired = true;
      track('signup_viewed', { entry_point: new URLSearchParams(location.search).get('entry') });
    }
  }, []);

  function trackStarted(method: 'email' | 'google') {
    if (startedFired) return;
    startedFired = true;
    track('signup_started', { method, field_first_touched: method === 'email' ? 'email' : null });
  }

  function trackFieldError(code: string, source: 'client' | 'server') {
    if (code === lastTracked.current) return;
    lastTracked.current = code;
    track('signup_field_errored', { field: 'email', error_code: code, error_source: source, attempt_n: attemptN.current });
  }

  function onBlur() {
    const input = emailRef.current;
    // A server error stays until the email is edited: re-validating here would clear it.
    if (!input || !input.value.trim() || error?.source === 'server') return;
    const code = validate(input);
    setError(code ? { code, source: 'client' } : null);
    if (code) trackFieldError(code, 'client');
  }

  async function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const input = emailRef.current!;
    attemptN.current += 1;

    const code = validate(input);
    if (code) {
      setError({ code, source: 'client' });
      trackFieldError(code, 'client');
      input.focus();
      return;
    }

    const email = input.value.trim();
    const ms = pending.current?.email === email ? pending.current.ms : Math.round(performance.now() - mountedAt.current);
    setError(null);
    setPhase('submitting');
    setLive('Creating your account…');
    track('signup_submitted', { method: 'email', time_to_submit_ms: ms, attempt_n: attemptN.current });

    const res = await createUser({ email, timeToSubmitMs: ms, website: honeypotRef.current?.value });
    if (res.ok) {
      pending.current = null;
      identify(res.user.id); // No client account_created: the server sends it.
      setUserId(res.user.id);
      setLive('Account created');
      setPhase('profile');
      return;
    }

    pending.current = res.retryable ? { email, ms } : null;
    track('signup_failed', { error_code: res.code, http_status: res.status, retryable: res.retryable });
    const fieldCode = res.fields?.email;
    if (fieldCode) {
      setError({ code: fieldCode, source: 'server' });
      trackFieldError(fieldCode, 'server');
    } else {
      setError({ code: res.code, source: 'request', status: res.status });
    }
    setLive(messageFor(fieldCode ?? res.code, res.status));
    setPhase('form');
    input.focus();
  }

  const liveRegion = (
    <div aria-live="polite" role="status" className="sr-only">
      {live}
    </div>
  );

  if (phase === 'done') {
    return (
      <>
        {liveRegion}
        <section aria-labelledby="done-title">
          <h2 id="done-title">You're all set</h2>
          <p className="mt-2">
            This was a demo sign-up, so there's no app to open here. On FX Replay, your next step would be your first replay session.
          </p>
          <a href="/" className="mt-6 inline-flex min-h-11 items-center rounded-md border border-line-control px-6 font-bold hover:bg-surface-3 active:bg-surface-2">
            Back to the home page
          </a>
        </section>
      </>
    );
  }

  if (phase === 'profile' || phase === 'saving') {
    return (
      <>
        {liveRegion}
        <ProfileStep userId={userId} saving={phase === 'saving'} onSaving={(s) => setPhase(s ? 'saving' : 'profile')} onDone={() => setPhase('done')} />
      </>
    );
  }

  const submitting = phase === 'submitting';
  const errorText = error ? messageFor(error.code, error.status) : null;

  return (
    <>
      {liveRegion}
      <div>
        <button
          type="button"
          onClick={() => {
            trackStarted('google');
            setGoogleNote(true);
          }}
          aria-describedby={googleNote ? 'google-note' : undefined}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-line-control px-6 font-bold hover:bg-surface-3 active:bg-surface-2"
        >
          Continue with Google (demo)
        </button>
        {googleNote && (
          <p id="google-note" className="mt-2 text-sm text-ink-muted">
            Google sign-in isn't connected in this demo. Use your email below.
          </p>
        )}
      </div>

      <p className="my-5 text-center text-ink-muted" aria-hidden="true">
        or
      </p>

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <div>
          <label htmlFor="email" className="block font-bold">
            Email
          </label>
          <p id="email-hint" className="text-sm text-ink-muted">
            Use a personal address: Gmail, Outlook, iCloud, Yahoo, Proton or AOL.
          </p>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            onFocus={() => trackStarted('email')}
            onBlur={onBlur}
            onChange={() => setError(null)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'email-hint email-error' : 'email-hint'}
            className="mt-1 min-h-11 w-full rounded-md border border-line-control bg-surface-2 px-3 text-ink"
          />
          {errorText && <FieldError id="email-error" text={errorText} />}
        </div>

        {/* Honeypot: off-screen, out of the tab order and hidden from assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Leave this field empty</label>
          <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand px-6 font-bold text-on-brand hover:bg-brand-hover active:bg-brand-pressed disabled:cursor-not-allowed disabled:bg-brand-disabled disabled:text-ink-disabled"
          >
            {submitting ? 'Creating your account…' : CTA_LABEL}
          </button>
          {/* Order under the button: offer line, then the counter (variant only). The offer never moves. */}
          <p className="mt-3 text-sm text-ink-muted">{OFFER_LINE}</p>
          {variant === 'counter' && <ProofCounter />}
        </div>
      </form>
    </>
  );
}
