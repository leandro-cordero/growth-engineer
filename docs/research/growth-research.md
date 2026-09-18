# "Try FX Replay Free" — Growth Research Brief
**Date:** 2026-09-18
**Audience:** builder of the ~6h Growth Engineer take-home (landing + signup + Users API + analytics + experiment)
**Objective served:** increase conversion rate from marketing traffic to **account creation**.

Evidence tiers used throughout:
`[observed]` = I fetched the page and saw it · `[benchmark]` = published data, source + date given · `[hypothesis]` = my inference.

---

## 0. Bottom line (3 highest-leverage moves)

1. **Lead with a no-signup interactive replay moment above the fold** (even a canned, 15-second scripted chart-replay: play/pause/step-forward on a fixed EURUSD bar sequence). Mechanism: this audience buys on "can I feel it working in 30 seconds"; it converts a *claim* ("best way to backtest") into *demonstrated* value before asking for anything. `[hypothesis]`, supported by interactive-demo engagement data `[benchmark]`.
2. **Make the free offer unambiguous in the hero and repeat it as CTA microcopy** — "Free forever · No credit card · 2 backtest sessions to start". FX Replay already *has* a genuinely free tier `[observed]`, and freemium visitor→signup benchmarks run ~13% organic vs ~7–8% for no-card trials `[benchmark]`. The offer is the single biggest lever and it costs zero engineering.
3. **Cut the signup to one visible field + Google OAuth, defer everything else** (email first, password/profile after the account exists; verification after first value, not before). Password is the single most-abandoned field type at 10.5% `[benchmark]`, and Google sign-in lifts are the most consistently replicated in the literature (20–40% typical) `[benchmark]`.

Everything below justifies, ranks and instruments these.

---

## A. Competitor / category teardown

### A.1 What I could and could not observe

| Product | Fetched? | Note |
|---|---|---|
| FX Replay (home, pricing) | Yes `[observed]` | |
| FX Replay signup form | **No** — `app.fxreplay.com/auth/signup` returns a client-rendered shell with no form markup in the HTML. **I could not observe the actual field count, OAuth options or verification placement.** Treat all statements about FXR's signup internals as unknown. |
| TradingView | Yes `[observed]` | |
| TrendSpider | Yes `[observed]` | |
| TradeZella | Yes `[observed]` | |
| Soft4FX (Forex Simulator) | Yes `[observed]` | |
| NinjaTrader | Yes `[observed]` | |
| ForexTester | **No** — HTTP 403 on both `/` and `/buy`. Bot-blocked. Not observed. |

### A.2 Above-the-fold teardown

| | Headline promise | Primary CTA | Offer framing | Social proof ATF | Pricing on home | Demo w/o signup |
|---|---|---|---|---|---|---|
| **FX Replay** `[observed]` | "Your strategy shouldn't be tested with real money" (risk-avoidance framing) | "Get started for free" | "Start for free. No credit card required." Plus a separate "5-day free trial" CTA elsewhere on page | 1M+ traders, Trustpilot, 3 named trader testimonials (lower on page) | No (link to /pricing) | **No** — static screenshots/carousel only |
| **TradingView** `[observed]` | "The best trades require research, then commitment." / "Where the world does markets" | "Get started for free" | "**$0 forever, no credit card needed**" directly under the button | "Join 100 million traders and investors" | No | Live market data widgets ATF; full charting gated |
| **TrendSpider** `[observed]` | "The AI-Powered Super Platform for Active Investors" | "Explore Product" / "Get Started Now" | Trial terms not stated on home | 20,000+ traders; 4.6–4.8★ Capterra/Chrome/Google; BBB A rating; Benzinga Fintech Awards 2021 & 2023; Inc. 5000 | No | "Request Demo" (sales-assisted) |
| **TradeZella** `[observed]` | "Meet Your AI Trading Partner" | "Get Started" | Not stated on home | 20.2B trades journaled; 100K+ traders; 500+ brokers; 4.8★ Trustpilot; **"126 people signed up in the last 24 hours"** (live-ish activity proof) | No | No |
| **Soft4FX** `[observed]` | "Practice makes perfect — the best tool to practice Forex trading." | "Download now" (+ "See pricing") | "Free demo" available, length unstated | "Join 26K+ Users" | No | Demo = downloadable MT4/MT5 plugin — high friction |
| **NinjaTrader** `[observed]` | "Trade the stocks you love. Futures-style." | "Start Trading" → /register | "Risk-Free Sim", unlimited sim trading w/ live data for 14 days, no minimum funding | "#1 rated futures broker"; 2M+ users; BrokerChooser Best Futures Broker 2025 & 2026 | No | Sim requires registration |

### A.3 The patterns that keep recurring

1. **Nobody shows pricing on the homepage.** 6/6 observed put pricing one click away `[observed]`. Deviating is a testable edge, not a default.
2. **The free offer is stated as CTA *microcopy*, not as a headline.** TradingView's "$0 forever, no credit card needed" under the button is the cleanest execution `[observed]`. FX Replay does this too but dilutes it by also advertising a "5-day free trial" on the same page — two different offers on one page is a comprehension tax `[observed]` `[hypothesis]`.
3. **Proof is quantified and third-party-anchored.** Every strong page pairs a big round number (users/trades) with an external rating (Trustpilot, Capterra, BBB, awards) `[observed]`. TradeZella's recency proof ("126 signed up in last 24h") is the most conversion-oriented format in the set.
4. **Nobody in this category ships a true ungated interactive product demo.** This is the clearest open gap `[observed]`. Across B2B SaaS generally, 18% of 5,000 sites now have an interactive-demo CTA (up from 12% in 2024), and 65% of demos are ungated — ungated demos show ~6% higher engagement ([Navattic, State of the Interactive Product Demo 2026](https://www.navattic.com/report/state-of-the-interactive-product-demo-2026)) `[benchmark]`.
5. **Headlines split into "avoid loss" vs "become better".** FX Replay and Soft4FX use practice/risk-avoidance; TradingView and TrendSpider use capability/scale. The risk-avoidance angle is the better fit for a *replay* product and is also the compliance-safe one (see C.4).
6. **Signup internals are consistently invisible to crawlers** (SPA-rendered). Any claim in your writeup about a competitor's field count should be caveated or verified manually in a browser.

---

## B. Signup-funnel conversion benchmarks

Use these to set targets and to reason about sample size — **not** to promise a number.

### B.1 Landing page → conversion action

- Median landing-page conversion rate across 41,000 pages / 464M visits: **6.6%**; **SaaS median 3.8%**, top quartile SaaS **11.6%** ([Unbounce Conversion Benchmark Report, Q4 2024 data](https://unbounce.com/average-conversion-rates-landing-pages/)) `[benchmark]`. Financial services median 8.4%.
- Same source: **79% of SaaS landing-page visits were mobile** `[benchmark]`. → mobile-first is not a nicety for this build; it is the majority case.
- By channel medians: email 19.3%, paid social 12%, paid search 10.9%, display 4.1% ([Unbounce, Q4 2024](https://unbounce.com/conversion-benchmark-report/saas-conversion-rate/)) `[benchmark]`. Channel mix moves the baseline more than page design does — hence the by-source dashboard cut in §D.

### B.2 Visitor → signup, by monetization model

From a Q1 2022–Q3 2025 dataset of 86 SaaS companies (71% B2B) ([First Page Sage](https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/)) `[benchmark]`:

| Model | Visitor → signup (organic) | Visitor → signup (paid) |
|---|---|---|
| Freemium | 13.3% | 15.9% |
| Free trial, opt-in (no card) | 8.5% | 7.1% |
| Free trial, opt-out (card required) | ~2.5% | — |

**Caveats you should state in your writeup:** small sample (86 companies), B2B-weighted, and a 2026 ChartMogul study of 200 products materially disagrees on the downstream numbers (opt-in trials 8.9% trial→paid vs the often-quoted 18%) `[benchmark]`. Do not present a single number as "the" benchmark.

**Relevance:** FX Replay runs a genuine freemium tier `[observed]`, so **~10–15% visitor→signup on a dedicated, high-intent "try free" landing page is a defensible target band**, and the classic 2–3% figure people quote for B2B SaaS websites is the wrong yardstick (that measures visitor→*lead*).

### B.3 Form-level benchmarks

- Only **~45% of people who reach a form complete it** (55% abandon); across 93M tracked sessions average completion is **51.7%**, desktop **55.5%** vs mobile **47.5%** ([Zuko Analytics form benchmarking](https://www.zuko.io/benchmarking/industry-benchmarking)) `[benchmark]`.
- **Password is the most-abandoned field type at 10.5%**, ahead of email (6.4%) and phone (6.3%) — often driven by over-restrictive complexity rules ([Zuko](https://www.zuko.io/blog/25-conversion-rate-statistics-you-need)) `[benchmark]`. This is the single most actionable form-level fact for a signup build.
- **Field count itself is weakly correlated with completion** — Zuko's own trend line across their dataset is essentially flat `[benchmark]`. The popular "fewer fields = more conversions" rule is *not* well supported; what's supported is reducing *friction per field* and *perceived* length. CXL has a documented case where removing fields **dropped** conversion 14% and restoring them raised it 19.21% `[benchmark]`.
- **Autofill matters and is free:** completion ranges 47%–71.5% where autofill is available `[benchmark]` — correct `autocomplete` attributes (`email`, `new-password`, `name`) are a zero-cost lift.
- ⚠️ The widely-repeated "multi-step forms convert 86% higher" claim traces to vendor content without a reproducible primary study. **Label it as folklore, not benchmark.** Zuko's own analysis is more cautious. Use multi-step for *perceived* friction reduction and progressive profiling, and justify it on mechanism, not on that number.

### B.4 Social login

- Commonly cited range: **social login lifts signups 20–40%** (Gigya-origin figure, widely recycled) `[benchmark, older / weakly sourced]`.
- Documented single-company A/B test: prominent Google Sign-In moved trial-start from 7.48% → 15.5% (**+107% relative**) ([il.ly case write-up](https://il.ly/blog/google-signin)) `[benchmark, n=1 company]`.
- Counter-example: Mailchimp measured only +3.4% landing→login and removed it for brand/design reasons `[benchmark]`.
- **Honest read:** effect size is highly context-dependent (provider, device, in-app browsers). Treat 20–40% as directional, never as a forecast. Apple sign-in converts on iOS and poorly on Android.

### B.5 Interactive demo

- Navattic's 2025 report (28,000+ demos, 280 user survey): users self-reported **~20–25% increase in website conversion rate** and demo leads at 10–20% of inbound volume ([Navattic 2025](https://www.navattic.com/report/state-of-the-interactive-product-demo-2025)) `[benchmark, self-reported survey — not causal]`.
- Top-quartile demos: 50.1% engagement, 28.9% completion, 12.8% CTR; average 2.1 min spent in demo `[benchmark]`.
- **Flag the incentive:** these are vendor-published, self-reported, uncontrolled. Cite them as directional evidence that ungated demos are a live pattern, not as a promised lift.

---

## C. Highest-leverage tactics for retail / prop-firm traders

Ranked by my confidence that they move **visit → account created** for *this* audience.

### C.1 Instant, no-signup product moment (highest leverage, biggest gap vs competitors)
This audience evaluates tools kinesthetically: can I scrub a chart bar-by-bar and does it feel fast. Nobody in the observed set lets them `[observed]`. A hero-embedded canned replay (fixed symbol, fixed 200-bar window, play / pause / step / speed, a "buy here" marker) is buildable in hours with lightweight canvas or a charting lib and prerendered OHLC JSON.
**Trade-off to name out loud:** a satisfying demo can *satisfy intent and suppress signups*. Guardrail: `demo_engaged → signup_start` rate, and total signups per 1,000 sessions (not just CTR). Mitigate by capping the demo (e.g. "you've replayed 200 bars — create a free account to pick any pair and date").

### C.2 Offer clarity and risk reversal
- "Free forever · No credit card · No auto-upgrade" beats "free trial" for a freemium product `[benchmark, B.2]`.
- **Remove the mixed offer.** FX Replay's home page carries both "Start for free, no credit card" *and* "Start your 5-day free trial" `[observed]`. For the challenge landing page, pick one offer and repeat it verbatim at every CTA. `[hypothesis]`
- Put the risk reversal *in the button vicinity*, TradingView-style, not in a footnote `[observed]`.

### C.3 Proof formats that work here
In rough order of credibility to a skeptical trader:
1. **Third-party ratings with the source named** (Trustpilot score + review count) — all strong competitors do this `[observed]`.
2. **Behavioral scale numbers** — "1M+ traders", "X backtests run this week". FX Replay already has the 1M figure `[observed]`.
3. **Recency/velocity proof** — TradeZella's "126 people signed up in the last 24 hours" `[observed]`. Cheap to implement honestly off your own Users API count; **only ship it if the number is real** (see C.4).
4. **Named traders with real handles/photos** — works if verifiable; anonymous "John D., +38% account" is actively counter-productive with this audience `[hypothesis]`.
5. **Logos of prop firms / data providers** — credibility by association, low copy cost.

### C.4 Anti-patterns and compliance risk (important — put this in your writeup, evaluators will notice)

- **Never put income, P&L, win-rate or account-growth claims on the page.** Under the revised FTC Endorsement Guides (effective 26 July 2023, [16 CFR Part 255](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255)), the old "results not typical" safe harbor is **gone**; you must disclose *generally expected* results and hold substantiation `[benchmark]`. A footer disclaimer does not cure an atypical-results testimonial.
- **Material connections must be disclosed** — if a testimonial trader got free Pro access or affiliate commission, say so next to the testimonial `[benchmark, FTC]`.
- **Simulated/backtested results are "hypothetical performance."** NFA Compliance Rule 2-29(c)(1) prescribes a non-customizable disclaimer, and Interpretive Notice 9025 requires disclosing material assumptions; CFTC Rule 4.41(b) parallels this ([NFA Rule 2-29](https://www.nfa.futures.org/rulebooksql/rules.aspx?Section=4&RuleID=RULE+2-29), [Interpretive Notice 9025](https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9)). FX Replay's own footer already carries CFTC 4.41-style language `[observed]`. **Whether FX Replay is an NFA member is something I could not verify** — but the safe design is: educational framing, no performance claims, disclaimer in footer, and any in-page equity curve labeled "hypothetical / illustrative".
- **Avoid urgency theater.** Countdown timers and "only 3 spots left" on a free product read as scammy to traders who have been marketed to by every signal-selling Telegram group. Fake scarcity is also an FTC deception risk. `[hypothesis]` + `[benchmark, FTC]`
- **Avoid "guaranteed", "risk-free" applied to trading outcomes.** NinjaTrader uses "Risk-Free Sim" but pairs it with heavy leverage/risk disclosure `[observed]`; the phrase only survives because it describes *simulation*, not returns.
- **Avoid a gated "book a demo" path** — wrong motion for a $0–$35/mo prosumer product; it signals enterprise sales and kills self-serve intent `[hypothesis]`.

### C.5 Friction reduction, specifically
- **Email + Google OAuth on step 1. Password created after the account exists, or replaced by a magic link.** Attacks the 10.5% password abandonment `[benchmark]`.
- **Do not require email verification before first value.** Verification before activation inserts a mandatory context switch to an inbox, which on mobile (79% of SaaS LP traffic `[benchmark]`) frequently ends the session. Verify *after* the first replay session, or gate only data-export/paid features. `[hypothesis]`
- **No credit card anywhere in the free path**, and say so.
- **Correct `autocomplete` + `inputmode="email"` + real mobile keyboards** `[benchmark]`.
- **Inline, on-blur validation with specific error copy** ("That email is already registered — sign in instead", with a link). Generic "Invalid input" is a silent conversion killer.

---

## D. Instrumentation recommendation

### D.1 Primary choice: **PostHog Cloud** (argue this, note the alternative)

Why it wins the signal-per-hour trade for a 6-hour build:
- **Product analytics + funnels + feature flags + A/B experiments + session replay in one SDK.** For a challenge that must show *both* a funnel *and* an experiment, one tool covering both is the whole argument. GA4 would need GTM + a separate experimentation tool (Google Optimize is dead), i.e. 2–3 integrations.
- **Autocapture plus explicit events**: you get a safety net without hand-instrumenting every click, while still defining a clean custom taxonomy for the funnel spine.
- **`identify()` / `alias()` anonymous→known stitching is first-class** and is the single hardest analytics requirement in this brief.
- **Reverse proxy** is documented and available managed and free on Cloud ([PostHog docs](https://posthog.com/docs/advanced/proxy)) `[benchmark]`.
- Generous free tier; self-serve; no account access to FX Replay production needed.

**Honest trade-off to state:** GA4 is what a marketing team likely already runs for paid-channel attribution and Google Ads conversion import. The production-correct answer is often **both**: PostHog as the product/experiment system of record, GA4 (via GTM) for ad-platform conversion feedback. For a 6h build, ship PostHog, document the GA4/GTM layer as next step. A Segment/CDP layer is the "right" long-term answer and the wrong 6-hour answer — document it.

### D.2 Event taxonomy

Conventions: `snake_case`, `object_action` naming, past-tense-free, properties flat, no PII in property values beyond hashed email.

**Global / super properties attached to every event**
```
anonymous_id, distinct_id, session_id
utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid/fbclid
referrer, referrer_domain, landing_path
device_type (mobile|tablet|desktop), viewport_w, os, browser
country (IP-derived, coarse), locale
experiment_key, experiment_variant        // null when not enrolled
app_version / build_sha
consent_state (granted|denied|unknown)
```

**Funnel spine**

| # | Event | Trigger | Key properties |
|---|---|---|---|
| 1 | `landing_page_viewed` | Page mount (once per session per path) | `page_variant`, `is_returning`, `lcp_ms`, `scroll_depth_max` (on unload) |
| 2 | `hero_cta_clicked` | Click on any primary CTA | `cta_id`, `cta_label`, `cta_position` (hero/sticky/footer), `time_on_page_ms` |
| 3 | `demo_started` | User presses play on the replay widget | `demo_symbol`, `demo_entry_point` |
| 4 | `demo_engaged` | ≥3 interactions or ≥15s of playback | `bars_replayed`, `interactions_count`, `duration_ms` |
| 5 | `demo_completed` | Reaches end of canned sequence / hits cap | `bars_replayed`, `duration_ms` |
| 6 | `signup_viewed` | Signup form/modal rendered & visible | `entry_point`, `form_variant`, `step_count` |
| 7 | `signup_started` | First keystroke or OAuth button click | `method` (email\|google), `field_first_touched` |
| 8 | `signup_field_errored` | Client or server validation error surfaced | `field`, `error_code`, `error_source` (client\|server), `attempt_n` |
| 9 | `signup_submitted` | Submit fires, request in flight | `method`, `field_count`, `time_to_submit_ms`, `attempt_n` |
| 10 | `signup_failed` | API returns non-2xx / network error | `error_code`, `http_status`, `retryable` (bool) |
| 11 | **`account_created`** | **Users API returns 201** — emit **server-side** | `user_id`, `method`, `email_domain_type` (free\|corporate\|disposable), `time_from_landing_ms` |
| 12 | `verification_email_sent` / `verification_completed` | Async | `delivery_provider`, `time_to_verify_ms` |
| 13 | `activation_first_session` | First replay session started *inside the product* as a logged-in user | `time_from_signup_ms` |

**Supporting events:** `pricing_viewed`, `faq_expanded` (`question_id`), `social_proof_viewed`, `experiment_enrolled` (`experiment_key`, `variant`, `assignment_source`), `web_vitals_reported` (`lcp`, `inp`, `cls`).

**Primary conversion event:** `account_created`.
**Primary conversion metric:** *unique-session conversion rate* = sessions with `account_created` / sessions with `landing_page_viewed`, cut by `utm_source/medium` and `device_type`.
**Secondary/diagnostic:** `landing → hero_cta_clicked`, `signup_viewed → signup_started`, `signup_started → account_created` (form completion), `account_created → activation_first_session`.

### D.3 Identity stitching (the part most candidates get wrong)

1. On first load, PostHog assigns an anonymous `distinct_id`; persist your own `anonymous_id` in a first-party cookie (`SameSite=Lax`, 1-year) **and** mirror it into `sessionStorage` for the session.
2. Send `anonymous_id` in the **body of the `POST /users` request**. The server stores it on the user row.
3. On 201, the server emits `account_created` with both `user_id` and `anonymous_id`, and calls `identify(user_id)` + `alias(anonymous_id → user_id)` so pre-signup pageviews and demo interactions retroactively attach to the user.
4. Also persist **first-touch UTM** (cookie, 90d) *and* last-touch UTM on the user record — otherwise your channel attribution silently becomes last-touch-only.
5. Never use email as `distinct_id` (PII in analytics + breaks on email change). Store `email_sha256` if you need a join key.

### D.4 Data-quality risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Ad blockers** — trading/finance audiences are heavily technical and block more than average `[hypothesis]` | Undercounts top-of-funnel, **inflates** apparent conversion rate | Reverse proxy on your own subdomain (avoid names containing `analytics`, `track`, `ph`, `posthog`) — PostHog documents a typical **10–30% event-capture recovery** ([PostHog docs](https://posthog.com/docs/advanced/proxy)) `[benchmark]`. Know that CNAME uncloaking erodes this over time. |
| **Client-side-only conversion tracking** | The one event you cannot afford to lose is the one most likely blocked | **Emit `account_created` server-side** from the Users API handler. This is the headline data-quality decision of this build. |
| **Denominator/numerator mismatch** | Server-side conversions ÷ client-side pageviews inflates CR | Report the primary CR from a **single source**; use the server count as a reconciliation check and publish the delta (expect a 20–40% gap vs GA4-style client counts `[benchmark]`). |
| **Duplicate events** | Double-counted conversions, broken funnels | Idempotency: `Idempotency-Key` header on `POST /users`; `event_id` (UUIDv7) per event with dedupe; disable submit button on in-flight; unique constraint on email in the Users store. |
| **Bots / scrapers / preview fetchers** | Fake sessions, fake signups | Filter known bot UAs; require a human-interaction signal (pointer/keydown) before counting a session; honeypot field + `time_to_submit_ms < 1500ms` heuristic on the signup API; exclude datacenter ASNs in the dashboard if available. |
| **Disposable emails** | Fake account_created, poisoned activation rate | Classify `email_domain_type` at signup and report conversion **with and without** disposable domains. This is also your lead-quality guardrail. |
| **Session stitching break across signup** | Pre-signup behavior orphaned from the user | See D.3 — alias on the server response, not only in the client. |
| **Attribution loss (iOS/ITP, 7-day cookie caps)** | Channel reporting degrades | First-party cookie set server-side via `Set-Cookie` (HttpOnly false so JS can read the anon id, or a paired readable cookie); capture `gclid`/`fbclid` at landing and store on the user row. |
| **Consent / GDPR** | Legal + data gaps | Consent banner gating non-essential cookies; record `consent_state` on events; PostHog can run in cookieless/memory mode pre-consent. Document that EU traffic will have a structurally lower capture rate. |
| **Schema drift** | Silent funnel breakage | A single typed `analytics.ts` module exporting named functions (`trackAccountCreated(props)`) — no raw `capture('string')` calls anywhere in components. Add a CI check that greps for raw capture calls. |

---

## E. Experiment candidates

### E.0 Sample-size math you should show

Two-proportion test, 95% two-sided, 80% power: **n per arm ≈ 16 · p(1−p) / Δ²** (Δ = absolute lift).

| Metric tested | Baseline p | Relative lift | Δ (abs) | n / arm | Total (2 arms) |
|---|---|---|---|---|---|
| Landing → `account_created` | 6% | +10% | 0.006 | ~25,100 | ~50,200 |
| Landing → `account_created` | 6% | +20% | 0.012 | ~6,300 | ~12,600 |
| Landing → `account_created` | 6% | +30% | 0.018 | ~2,800 | ~5,600 |
| Landing → `signup_started` | 15% | +20% | 0.030 | ~2,300 | ~4,600 |
| `signup_started` → `account_created` | 60% | +10% | 0.060 | ~1,100 | ~2,200 |

**The lesson to write down explicitly:** end-to-end conversion tests are expensive; **mid-funnel tests on high-baseline steps are 10–20× cheaper**. If FX Replay's "try free" landing gets, say, 1,000 sessions/day (**stated assumption — I have no traffic data**), a +20% end-to-end test needs ~13 days; a +10% test needs ~50 days and should not be run. Anything below ~300 sessions/day should use **sequential testing with a pre-registered stopping rule, or qualitative methods (5-user moderated tests, session replay review, exit-intent micro-survey) instead of an underpowered A/B test.** Saying this is worth more than running a fake test.

### E.1 — Ungated interactive replay demo in hero *(proposal-only, or a stub in v1)*
- **Hypothesis:** We believe that an ungated, hands-on 15-second replay widget for landing visitors will increase landing→`account_created` because this audience needs to *feel* the product's core loop before trusting a claim, and no competitor offers it.
- **Control:** static product screenshot ATF. **Variant:** interactive canned replay with play/step/speed, capped, with an in-widget CTA on cap.
- **Primary:** landing → `account_created` (session-unique).
- **Guardrail:** `demo_engaged → signup_started` and absolute signups per 1,000 sessions — detects intent satisfaction.
- **Expected effect:** plausibly +10–25% relative `[hypothesis]`; vendor self-report suggests ~20–25% site CR lift `[benchmark, uncontrolled]`. Needs ~12.6k sessions total at +20%.
- **Feasible in 6h?** A *simple* version (prerendered OHLC JSON + canvas + play/pause/step) is ~1.5–2h and is the highest-signal thing you could build. The A/B test around it is proposal-only.

### E.2 — Single-field + Google OAuth signup vs. full form *(build both in v1 behind a flag — cheapest real experiment)*
- **Hypothesis:** We believe that reducing the visible first step to email-only plus "Continue with Google", deferring password and name, will increase `signup_started → account_created` for landing visitors, because password is the most-abandoned field type (10.5%, Zuko) and OAuth collapses four steps into one.
- **Control:** name + email + password + confirm + ToS checkbox, one screen.
- **Variant:** email (or Google) → account created → password/profile collected post-conversion.
- **Primary:** form completion rate (`signup_started → account_created`).
- **Guardrail:** `email_domain_type = disposable` share, and `account_created → activation_first_session` (lead quality — the explicit trade-off: less friction, weaker intent).
- **Effect/size:** +10% on a 60% baseline needs only ~2,200 sessions total — **runnable in days.** Best candidate for a genuinely powered test.
- **Feasible in 6h?** Yes — two form variants behind one PostHog feature flag is maybe 45 minutes once the form exists.

### E.3 — Offer framing in hero: "Free forever, no credit card" vs "Start your free trial" *(build in v1, copy-only flag)*
- **Hypothesis:** We believe that "Free forever · No credit card · No auto-upgrade" will outperform trial framing for cold traffic because freemium models show materially higher visitor→signup rates than opt-in trials (13.3% vs 8.5% organic, First Page Sage) and because trial framing implies a future charge to a price-sensitive audience.
- **Primary:** landing → `signup_viewed` (cheap, high baseline) with landing → `account_created` as secondary.
- **Guardrail:** downstream free→paid intent proxy (`pricing_viewed` rate); a purely-free frame may attract non-buyers.
- **Effect:** copy tests are usually small (0–15%) `[hypothesis]`; power on the `signup_viewed` step, not the end.
- **Feasible in 6h?** Yes, trivially — it's a string behind a flag. Good demonstration of experiment plumbing.

### E.4 — Social proof block above vs below the fold, quantified vs testimonial *(build-lite / proposal)*
- **Hypothesis:** We believe that placing a quantified trust bar ("1M+ traders · 4.x★ Trustpilot (n reviews) · free forever") immediately under the hero CTA will increase `hero_cta_clicked` because skeptical traders resolve the credibility question before the value question.
- **Primary:** `landing_page_viewed → hero_cta_clicked`. **Guardrail:** `hero_cta_clicked → account_created` (don't buy clicks from unqualified curiosity).
- **Only ship claims you can substantiate** — see C.4.
- **Feasible in 6h?** Yes as a layout variant; as a test, proposal-only.

### E.5 — Progressive multi-step signup with a "what do you trade?" first step *(proposal-only)*
- **Hypothesis:** We believe a 2-step form that asks a low-commitment, self-relevant question first (instrument: FX / futures / stocks) will increase completion via commitment-consistency and reduced perceived length.
- **Primary:** `signup_viewed → account_created`. **Guardrail:** total time-to-submit; mobile completion rate specifically.
- **Caution to state:** the popular "+86% for multi-step" stat is unsubstantiated folklore; justify on mechanism and measure it yourself.
- **Feasible in 6h?** The UI is ~1h; as a *third* concurrent variant it fragments traffic. Propose, don't ship.

---

## F. Prioritization (ICE, 1–10 each; score = mean)

| # | Opportunity | I | C | E | ICE | v1 or next? |
|---|---|---|---|---|---|---|
| 1 | Offer clarity: single unambiguous "free forever, no card, no auto-upgrade" repeated at every CTA | 8 | 9 | 10 | **9.0** | **v1** |
| 2 | Server-side `account_created` + anon→user aliasing (trustworthy primary metric) | 9 | 9 | 8 | **8.7** | **v1** |
| 3 | Low-friction signup: email + Google OAuth (simulated), deferred password, proper `autocomplete`, inline field-level errors | 8 | 8 | 9 | **8.3** | **v1** |
| 4 | Typed analytics module + full funnel taxonomy (D.2) wired end-to-end | 8 | 9 | 8 | **8.3** | **v1** |
| 5 | Quantified, substantiated trust bar under the hero CTA | 7 | 8 | 9 | **8.0** | **v1** |
| 6 | Mobile-first hero (79% of SaaS LP traffic is mobile) + CWV budget (LCP image priority, no blocking 3P) | 7 | 9 | 8 | **8.0** | **v1** |
| 7 | Feature-flagged A/B harness with `experiment_enrolled` event + deterministic bucketing | 7 | 8 | 8 | **7.7** | **v1** (one live test: E.3 or E.2) |
| 8 | Ungated interactive replay demo in hero | 9 | 6 | 5 | **6.7** | **v1 if time survives** (highest ceiling, biggest risk) |
| 9 | A11y: semantic landmarks, visible focus, labelled inputs, `aria-live` error/success region, 4.5:1 on #0260FD over #030303 | 6 | 9 | 8 | **7.7** | **v1** (cheap, explicitly graded) |
| 10 | Bot/disposable-email filtering + idempotency key on `POST /users` | 6 | 8 | 8 | **7.3** | **v1** (tiny, shows production thinking) |
| 11 | Reverse proxy for analytics | 6 | 8 | 6 | **6.7** | next step (document) |
| 12 | Consent banner + `consent_state` on events | 5 | 8 | 6 | **6.3** | next step (document) |
| 13 | Multi-step progressive signup | 6 | 5 | 6 | **5.7** | next step |
| 14 | GA4/GTM layer for ad-platform conversion import | 6 | 7 | 5 | **6.0** | next step |
| 15 | Segment/CDP, warehouse (BigQuery/DuckDB) + dbt funnel models | 7 | 7 | 2 | **5.3** | next step |
| 16 | Pricing transparency on the landing page (deviates from 6/6 competitors) | 5 | 4 | 7 | **5.3** | next step / test |
| 17 | Magic-link passwordless auth | 6 | 5 | 4 | **5.0** | next step |
| 18 | Urgency/scarcity mechanics | 3 | 3 | 8 | **4.7** | **do not build** (audience + FTC risk) |

**v1 build order for a 6-hour box:** #1 → #3 → #4/#2 (analytics as you build, not after) → #6/#9 → #5 → #7 with one live flagged test → #10 → #8 only if ≥90 minutes remain.

**What you explicitly say you did not build and why:** the demo widget (if cut), reverse proxy, consent, CDP/warehouse, GA4 layer, multi-step form. Evaluators said they value prioritization over completeness — the *documented cut list with rationale* is a scored artifact, not an apology.

### Dashboard cuts to specify
Funnel (landing → CTA → signup_viewed → signup_started → account_created → activation), broken by: `utm_source/medium`, `device_type`, `country`, `experiment_variant`, new vs returning. Plus a data-quality panel: server `account_created` count vs client count, disposable-email share, bot-filtered sessions, median `time_to_submit_ms`, `signup_field_errored` by field.

---

## G. Open questions & risks

1. **I could not observe FX Replay's real signup form** (SPA shell, no markup). Field count, OAuth availability and verification placement are unknown — do not assert them in your writeup.
2. **ForexTester is bot-blocked (403).** Not observed. If you want it in the teardown, open it in a browser manually.
3. **No traffic data.** All sample-size runtimes in §E are conditional on the stated 1,000 sessions/day assumption. If real traffic is an order of magnitude lower, the honest recommendation is sequential testing + qualitative research, not A/B.
4. **Vendor-published benchmarks dominate this space.** Navattic (demos), Gigya-lineage social-login numbers, and the "86% multi-step" claim are all vendor/self-reported or unsourced. I've labeled them; keep the labels in your writeup — showing you know which numbers are weak is itself a signal.
5. **Regulatory status unverified.** Whether FX Replay is NFA-registered (and therefore bound by Rule 2-29) is unknown to me. The recommended copy posture (educational framing, zero performance claims, hypothetical-results labeling) is safe either way.
6. **What would change the recommendation:** if FX Replay's activation data shows free signups rarely run a first backtest, the bottleneck is activation, not signup, and lowering signup friction would make the funnel look better while making the business worse. The `account_created → activation_first_session` guardrail is what detects this — which is why it belongs in v1 instrumentation even though it's out of the stated objective's scope.

---

### Sources
- [Unbounce — Average landing page conversion rates (Q4 2024 data)](https://unbounce.com/average-conversion-rates-landing-pages/) · [Unbounce SaaS benchmark](https://unbounce.com/conversion-benchmark-report/saas-conversion-rate/)
- [First Page Sage — SaaS free trial conversion rate benchmarks (Q1 2022–Q3 2025 dataset)](https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/)
- [Zuko Analytics — form benchmarking by industry](https://www.zuko.io/benchmarking/industry-benchmarking) · [Zuko — 25 conversion rate statistics](https://www.zuko.io/blog/25-conversion-rate-statistics-you-need)
- [Navattic — State of the Interactive Product Demo 2025](https://www.navattic.com/report/state-of-the-interactive-product-demo-2025) · [2026 edition](https://www.navattic.com/report/state-of-the-interactive-product-demo-2026)
- [Sign in with Google A/B case study (il.ly)](https://il.ly/blog/google-signin) · [Corbado — social login conversion benchmarks](https://www.corbado.com/blog/social-login-conversion-rate)
- [PostHog — deploy a reverse proxy](https://posthog.com/docs/advanced/proxy) · [PostHog — product analytics best practices](https://posthog.com/docs/product-analytics/best-practices)
- [FTC Endorsement Guides, 16 CFR Part 255 (rev. eff. 2023-07-26)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255)
- [NFA Compliance Rule 2-29](https://www.nfa.futures.org/rulebooksql/rules.aspx?Section=4&RuleID=RULE+2-29) · [NFA Interpretive Notice 9025](https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9)
- Pages observed 2026-09-18: [fxreplay.com](https://www.fxreplay.com/), [fxreplay.com/pricing](https://www.fxreplay.com/pricing), [tradingview.com](https://www.tradingview.com/), [trendspider.com](https://trendspider.com/), [tradezella.com](https://www.tradezella.com/), [soft4fx.com](https://www.soft4fx.com/), [ninjatrader.com](https://ninjatrader.com/)
