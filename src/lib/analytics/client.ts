import { EXPERIMENTS } from '../experiments/bucket';
import { SUPER_PROPERTY_KEYS, type ClientEventName, type EventProps } from './events';

type Prim = string | number | boolean | null;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const FIRST_TOUCH_COOKIE = 'fxr_ft';
const LAST_TOUCH_KEY = 'fxr_lt';

// ---------------------------------------------------------------- super properties (pure)

interface SuperPropsInput {
  /** Reads an attribute off <html>: the head script wrote the experiment variants there. */
  attr: (name: string) => string | null;
  cookie: string;
  search: string;
  /** Last touch from sessionStorage. */
  lastTouch: string | null;
}

export function readSuperProps({ attr, cookie, search, lastTouch }: SuperPropsInput) {
  const params = new URLSearchParams(search);
  const fromUrl = Object.fromEntries(UTM_KEYS.map((k) => [k, params.get(k)]));
  const hasUtm = UTM_KEYS.some((k) => fromUrl[k]);

  // Last touch: this visit's UTMs when it has any, else what the session already had.
  const stored = safeJson(lastTouch);
  const last: Record<string, string | null> = hasUtm ? fromUrl : Object.fromEntries(UTM_KEYS.map((k) => [k, stored[k] ?? null]));

  // First touch: write-once cookie (90 days). Written on the first visit even with no UTMs, so a
  // later campaign click on a returning visitor never becomes their "first" touch.
  const existing = cookie.match(new RegExp(`(?:^|; )${FIRST_TOUCH_COOKIE}=([^;]+)`))?.[1];
  const first = existing ? safeJson(decodeURIComponent(existing)) : { source: fromUrl.utm_source, campaign: fromUrl.utm_campaign };

  const cookieAid = cookie.match(/(?:^|; )fxr_aid=([^;]+)/)?.[1] ?? null;
  const props: Record<string, Prim> = {
    anonymous_id: cookieAid,
    app_env: attr('data-app-env') ?? 'development',
    ...last,
    first_touch_utm_source: first.source ?? null,
    first_touch_utm_campaign: first.campaign ?? null,
    ...Object.fromEntries(EXPERIMENTS.map(({ key }) => [`$feature/${key}`, attr(key)])),
  };
  return {
    props,
    lastTouch: JSON.stringify(last),
    firstTouchCookie: existing ? null : encodeURIComponent(JSON.stringify({ source: first.source ?? null, campaign: first.campaign ?? null })),
  };
}

function safeJson(raw: string | null | undefined): Record<string, string | null> {
  try {
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------- dev-only property check

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const SUPER = new Set<string>(SUPER_PROPERTY_KEYS);

/** Returns a description of the first problem, or null. Called in dev only. */
export function findPropertyProblem(props: Record<string, unknown>): string | null {
  for (const [k, v] of Object.entries(props)) {
    if (!SNAKE.test(k)) return `"${k}" is not snake_case`;
    if (SUPER.has(k)) return `"${k}" is a super property and must not be repeated`;
    if (v === undefined) return `"${k}" is undefined (use null)`;
    if (v !== null && !['string', 'number', 'boolean'].includes(typeof v)) return `"${k}" is not a flat primitive`;
  }
  return null;
}

// ---------------------------------------------------------------- loader + track

type PostHogLike = typeof import('posthog-js').default;
type Job = (ph: PostHogLike) => void;

let queue: Job[] = [];
let ready: PostHogLike | null = null;
let started = false;
let enabled = false;

const run = (job: Job) => {
  try {
    if (ready) job(ready);
    else if (enabled || !started) queue.push(job);
  } catch (err) {
    console.warn('analytics job failed', err);
  }
};

/** Never throws. Calls before PostHog has loaded are queued and flushed after `init`. */
export function track<N extends ClientEventName>(name: N, props: EventProps<N>): void {
  if (import.meta.env.DEV) {
    const problem = findPropertyProblem(props as Record<string, unknown>);
    if (problem) console.warn(`[analytics] ${name}: ${problem}`);
  }
  run((ph) => ph.capture(name, props as Record<string, unknown>));
}

/** Backup merge after the server's alias: ties this browser to the new user id. */
export function identify(userId: string): void {
  run((ph) => ph.identify(userId));
}

/**
 * Loads posthog-js on idle, or on the first pointerdown/keydown, whichever comes first, so a fast
 * CTA click isn't lost. Without a key, analytics is off and queued calls are dropped.
 */
export function initAnalytics({ key, host }: { key?: string; host: string }): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  if (!key) {
    queue = [];
    return;
  }
  enabled = true;

  const load = () => {
    window.removeEventListener('pointerdown', load);
    window.removeEventListener('keydown', load);
    if (ready) return;
    import('posthog-js')
      .then(({ default: posthog }) => {
        const html = document.documentElement;
        const sp = readSuperProps({
          attr: (n) => html.getAttribute(n),
          cookie: document.cookie,
          search: location.search,
          lastTouch: safeGet(() => sessionStorage.getItem(LAST_TOUCH_KEY)),
        });
        if (sp.firstTouchCookie) document.cookie = `${FIRST_TOUCH_COOKIE}=${sp.firstTouchCookie};max-age=7776000;path=/;SameSite=Lax`;
        safeGet(() => sessionStorage.setItem(LAST_TOUCH_KEY, sp.lastTouch));

        posthog.init(key, {
          api_host: host,
          ui_host: 'https://us.posthog.com',
          bootstrap: sp.props.anonymous_id ? { distinctID: String(sp.props.anonymous_id) } : undefined,
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          disable_session_recording: true,
          disable_surveys: true,
          advanced_disable_flags: true,
          person_profiles: 'always',
        });
        posthog.register(sp.props);
        if (new URLSearchParams(location.search).get('internal') === '1') posthog.opt_out_capturing();

        ready = posthog;
        const jobs = queue;
        queue = [];
        for (const job of jobs) run(job);
      })
      .catch((err) => console.warn('posthog-js failed to load', err));
  };

  window.addEventListener('pointerdown', load, { once: true, passive: true });
  window.addEventListener('keydown', load, { once: true });
  (window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2000)))(load);
}

function safeGet<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
