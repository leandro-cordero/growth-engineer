# Analytics plan

Analytics is part of the product: the event map is typed code, the conversion is sent from the
server, and every number below has a named way to be checked. Decisions and their reasons live
in `docs/decisions.md` › Analytics; evidence in `docs/research/growth-research.md` §D. This doc
is the single readable summary. Once built, `src/lib/analytics/events.ts` is the source of truth
for names and properties; if it and this doc disagree, the code wins and this doc is fixed.

---

## 1. Architecture and tooling

**PostHog Cloud** — `posthog-js` in the browser, `posthog-node` on the server.

- **Why PostHog:** funnels, feature-flag reporting, experiment analysis and identity stitching in
  one SDK. GA4 would need GTM plus a separate experimentation tool (growth-research §D.1).
- **What we'd add in production:** GA4 via GTM for ad-platform conversion import (Google Ads,
  Meta), fed from the same server-side `account_created`. A CDP (Segment) and a warehouse are
  the long-term answer and the wrong 6-hour answer.

```
browser                                  server (Vercel function)
 track() ───────────────────────► /rly/* ──rewrite──► PostHog ◄── posthog-node
  (lazy posthog-js, on idle)     (same-origin proxy)             account_created
                                                                 (after the DB write)
```

| Piece | Role |
|---|---|
| `lib/analytics/events.ts` | The only place event names exist; each marked `client` or `server`. `satisfies` fails the build if they drift. |
| `lib/analytics/client.ts` | `track()`: lazy-loads posthog-js on idle, registers super properties, never throws. |
| `lib/analytics/server.ts` | `accountCreated()`: 1.5s time box, never fails a signup. |
| `vercel.json` `/rly/*` | Same-origin proxy so ad blockers don't drop client events. |

## 2. Conversion funnel

```
landing_page_viewed → cta_clicked → signup_viewed → signup_started → signup_submitted → account_created
      (entry)                                                                          (conversion)
```

- **Funnel entry:** `landing_page_viewed`.
- **Intermediate steps:** `cta_clicked` (which CTA), `signup_viewed` (arrived, with
  `entry_point`), `signup_started` (first intent), `signup_submitted` (request sent).
- **Primary conversion event:** `account_created`, sent by the server after the user is written.
- **Primary conversion metric:** unique visitors with `account_created` ÷ unique visitors with
  `landing_page_viewed`, 7-day window, `app_env = production`, `is_suspected_bot = false`.
  Computed as its own two-step funnel, so a lost
  middle event never moves the headline number.
- **Diagnostic:** the full step funnel, broken down by last-touch `utm_source`/`utm_campaign`,
  `first_touch_utm_source`, `device_type`, `entry_point`, and each `$feature/<key>`.
- **Target band:** 10–15% landing → account for a dedicated freemium "try free" page
  (growth-research §B.2) `[benchmark, small B2B-weighted sample]` — a yardstick, not a promise.

## 3. Events

| Event | Side | Trigger | Properties | Answers |
|---|---|---|---|---|
| `landing_page_viewed` | client | landing module script, once per load | `is_returning` | Funnel entry; experiment exposure for `hero_offer_v1`; sample-ratio check |
| `cta_clicked` | client | one delegated listener on `[data-cta-id]` | `cta_id`, `cta_label`, `cta_position` (`hero`/`sticky`/`final`…) | Which CTA position drives signups |
| `signup_viewed` | client | `SignupForm` mount | `entry_point` (from `?entry=`), `form_variant` | Landing → signup handoff; exposure for `signup_proof_v1` |
| `signup_started` | client | first field focus, or the Google button | `method` (`email`/`google`), `field_first_touched` | Friction before the first keystroke |
| `signup_field_errored` | client | client validation or a server field error | `field`, `error_code`, `error_source` (`client`/`server`), `attempt_n` | Where validation friction is |
| `signup_submitted` | client | after the request is sent | `method`, `time_to_submit_ms`, `attempt_n` | Form completion; client side of reconciliation |
| `signup_failed` | client | failed outcome | `error_code`, `http_status`, `retryable` | API-failure guardrail |
| `account_created` | **server** | `service.ts`, after the write | `user_id`, `method`, `email_domain_type` (`free`/`corporate`/`disposable`), `is_suspected_bot`, `anonymous_id`, `$feature/<key>` per experiment | **The conversion**, safe from ad blockers |
| `profile_updated` / `profile_skipped` | client | the post-signup profile step | — | Lead-quality proxy (the only one without a product) |

Conventions (CLAUDE.md §2): `object_action`, past tense, snake_case; properties flat primitives,
`null` instead of an omitted key. No autocapture, no session replay, no sampling: only events
from the map are sent.

### Super properties (user / session context)

Registered once in `client.ts`, never repeated in an event:
`anonymous_id`, `app_env`, `utm_*` (always last touch), `first_touch_utm_source`,
`first_touch_utm_campaign`, and one `$feature/<experiment_key>` per experiment
(`null` when not enrolled). PostHog adds device, browser, OS, coarse geo and `$session_id`.

### Identity

1. `IdentityBoot.astro` sets `fxr_aid` (first-party cookie, 1 year, `SameSite=Lax`); PostHog
   bootstraps with the same id, so pre-signup events share one distinct id.
2. First touch goes in `fxr_ft` (90 days, write-once), last touch in `sessionStorage`.
3. `POST /api/users` carries `anonymous_id`. The server aliases the anonymous id into the new
   `user_id` **after** capturing `account_created`, so the whole pre-signup path joins the user.
4. Email is never a distinct id or an event property.

Known trade-off: Safari ITP caps JS-set cookies at 7 days, weakening first-touch on Safari.

## 4. Making the data trustworthy

| Risk | What we do | How we'd notice it failing |
|---|---|---|
| Ad blockers drop the conversion | `account_created` is server-side; client events go through the `/rly` proxy | Reconciliation below |
| Double counting | Idempotency-Key on `POST /api/users`; replays and honeypot hits send nothing; `account_created` has a deterministic uuid, so a re-send dedupes | `account_created` count > stored users |
| Lost conversions | 1.5s capture time box, failures logged | Weekly: `GET /api/users` count for the window = production `account_created` count |
| Client/server mismatch | — | Weekly: `account_created` ÷ unique `signup_submitted` should sit around 0.8–1.0 |
| Test traffic | Every event carries `app_env`; one "internal and test users" filter; `?internal=1` opts a browser out | Non-production `app_env` in production insights |
| Bots | Honeypot (fake 201, nothing stored); `time_to_submit_ms < 1500` flagged as `is_suspected_bot`, not blocked (client-reported, weak) | Bot share on the dashboard |
| Low-quality emails | `email_domain_type` classification; report conversion with and without `disposable` | Disposable share on the dashboard |
| Schema drift | Typed map + `satisfies`; test that no event property shadows a super property; dev-only runtime check for snake_case, flat values, no `undefined`; test that the PostHog SDKs are imported only in their wrappers | Build/test failure |

## 5. Two experiments at once

`hero_offer_v1` and `signup_proof_v1` run together, so a single `experiment_key` /
`experiment_variant` pair isn't enough. Every client event carries one flat `$feature/<key>`
super property per registered experiment (`null` when not enrolled), the name PostHog's
experiment analysis reads. The `POST /api/users` body sends the same values as `experiments`
(a flat key → variant map, `src/lib/users/schema.ts`), and the server copies them onto
`account_created`.

## 6. Experiment instrumentation

- **Assignment:** deterministic FNV-1a hash of `fxr_aid` + experiment key
  (`lib/experiments/bucket.ts`), computed pre-paint by the inline head script, so no flicker and
  no flag request. Each experiment has its own key, so assignments are independent.
- **Exposure:** the first event of the surface the experiment changes — `landing_page_viewed`
  for `hero_offer_v1`, `signup_viewed` for `signup_proof_v1` — with `$feature/<key>` set.
- **Conversion:** `account_created` carries the same `$feature/<key>` values, sent in the
  `POST /api/users` body.
- **Sample-ratio check:** exposures per variant against 50/50; a deviation at p < 0.001 makes a
  result inconclusive.
- Full design and decision rules: `docs/experiment-proposal.md`.

## 7. Dashboard

"Try FX Replay Free — signup funnel" in PostHog:

1. **Headline:** primary metric, daily and 7-day.
2. **Funnel:** the six steps, broken down by source, device, `entry_point` and variant.
3. **Experiment:** per `$feature/<key>`: exposures, primary metric, guardrails.
4. **Data quality:** stored users vs `account_created`; `account_created` ÷ `signup_submitted`;
   bot share; disposable share; `signup_field_errored` by
   `field` × `error_code`; median `time_to_submit_ms`.

## 8. Not built, and next

- **Consent management (out of scope).** Events are sent without a consent step. In production,
  EU/UK traffic needs a consent banner before non-essential cookies. Plan: PostHog's
  `cookieless_mode: 'on_reject'` so declined visitors are still counted, and `analytics_consent`
  on `account_created` so the server-side conversion and the client-side denominator describe
  the same population (a visitor who ignores the banner sends no client events, but still
  converts on the server). Without that, the headline metric reads high.
- `scroll_depth` / section-in-view events: a bounce and a full read that ends in a close are
  the same row today.
- Web-vitals events (`lcp`, `inp`, `cls`) from real users.
- GA4/GTM conversion import; a warehouse with modelled funnels.
- `activation_first_session` — there is no product to activate in. In production it is the
  guardrail that stops a signup lift from being bought with worse leads
  (growth-research §G.6).
