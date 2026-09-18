# Experiment brief — `signup_email_gate_v1`
**Date:** 2026-09-18
**Builds on:** `docs/research/growth-research.md` (the category teardown, benchmarks and ICE
backlog are not repeated here). This doc adds (1) a funnel analysis of what is *actually shipped*
in this repo and (2) one narrowly scoped experiment hypothesis.
**Objective served:** marketing traffic → **account creation**.

Evidence tiers, same as the main brief:
`[observed]` = I read the code / fetched the page · `[benchmark]` = published data, source + date
· `[hypothesis]` = my inference.

---

## 1. The funnel as built

Eight stages, the events that measure each, and the leak I can see in the code. Everything in this
section is `[observed]` unless marked.

| # | Stage | Measured by | Leak / gap visible in the code |
|---|---|---|---|
| 1 | Click → landing view | `landing_page_viewed {is_returning}` | Fires once per **load**, not per session. More seriously: **consent censors the denominator** — see 1.1. |
| 2 | Landing view → page engagement | **nothing** | No scroll depth, no section-in-view, no FAQ-expanded event. A bounce above the fold and a full read that ends in a close are the same row in the data. |
| 3 | Engagement → CTA click | `cta_clicked {cta_id, cta_label, cta_position}` | Sticky CTA **exposure** is unmeasured, so sticky CTR has no denominator. `cta_label` is identical for all four positions — the property carries zero information today. No `time_on_page_ms`. |
| 4 | CTA click → signup view | `signup_viewed {entry_point, form_variant}` | `entry_point` via `?entry=` is solid. `form_variant` is hardcoded `'email_only'` — a typed slot for a variant that does not exist. |
| 5 | Signup view → start | `signup_started {method, field_first_touched}` | `/signup` is stripped of every reassurance the landing page carried: no proof, no value recap, and the offer line sits **below** the submit button. Nothing measures what a leaver saw. No abandon/timing event. |
| 6 | Start → submit | `signup_field_errored`, `signup_submitted` | **Two hard frictions that are measured but have no variant** — the Google fake door and the email-domain allowlist. See 1.2 and 1.3. |
| 7 | Submit → **`account_created`** | `signup_submitted` (client) / `account_created` (server) / `signup_failed` | The strongest part of the build: server-emitted, idempotent, deterministic uuid. Aliasing only happens on consent accept, so declined converters cannot be joined to their landing session. |
| 8 | `account_created` → profile | `profile_updated` / `profile_skipped` | Post-conversion, so out of the objective — but it is the **only** lead-quality signal there is. There is no product, so no `activation_first_session`. |

### 1.1 The measurement defect that affects every experiment

The client analytics flush returns early when consent is undecided, and `track()` only queues.
A visitor who **ignores** the consent banner therefore emits **zero client events**, including
`landing_page_viewed`. `account_created` is emitted server-side and is **not** gated on consent
(consent only decides whether to alias).

So the headline metric in `decisions.md` — unique `account_created` ÷ unique
`landing_page_viewed` — has a **censored denominator and an uncensored numerator**, and reads
high by whatever the ignore rate is. `[observed]`

Compounding it: the consent banner is `position: fixed; bottom: 0` at z-index 1000 and the sticky
CTA is `position: fixed; bottom: 0` at z-index 100. On mobile the banner **occludes the primary
mobile CTA** until it is dismissed, and there is no banner-impression event, so the collision is
invisible in the data. `[observed]`

### 1.2 Friction measured, never varied — the Google fake door

"Continue with Google (demo)" sits **above** the email field. Clicking it fires
`signup_started {method: 'google'}` and then renders a notice that it is not connected. That
cohort's conversion is fully measurable today (`signup_started{google}` → `signup_submitted`)
and is, by construction, a dead end for anyone who came intending to use OAuth.

### 1.3 Friction measured, never varied — the email allowlist

Only ~43 consumer email domains may register. Everything else — company domains, national
ISP/webmail domains (`uol.com.br`, `wp.pl`, `seznam.cz`, `rediffmail.com`, `libero.it`,
`btinternet.com`, `comcast.net`, `sbcglobal.net`, `free.fr`, `bigpond.com`, `daum.net` …) and
Apple Hide-My-Email / SimpleLogin aliases — is rejected at the field with
`unsupported_email_domain`, on the client **and** in the API. It is the only place in the whole
funnel where a legitimate visitor with clear intent is **100% blocked**. `[observed]`

It is instrumented (`signup_field_errored {error_code: 'unsupported_email_domain'}`) but the
event does **not** carry which domain was tried, so the blocked segment can be counted and not
diagnosed. `[observed]`

### 1.4 Cross-cutting instrumentation gaps

- **Only one experiment fits the event schema.** `account_created` carries a single
  experiment key/variant pair; a second concurrent experiment has nowhere to go.
- **No SRM surface.** Split ratio is only observable through `landing_page_viewed` by
  experiment variant — which is itself consent-censored (1.1).

**Weakest link:** stage 6. It is the only stage in the funnel that contains an outright
*rejection* of a willing user, and the two mechanisms that do it (1.2, 1.3) are both decisions
we made ourselves, with no evidence attached and no variant behind them.

---

## 2. Candidate shortlist

Scoped to the rule: one or two components, variant B against the shipped version as A.
ICE, 1–10 each, score = mean.

| # | Candidate | I | C | E | ICE |
|---|---|---|---|---|---|
| **A** | **`signup_email_gate_v1`** — replace the domain **allowlist** with a disposable **blocklist** at the email field | **8** | **8** | **6** | **7.3** |
| B | `signup_proof_v1` — substantiated proof line directly under the submit button on `/signup` | 5 | 6 | 9 | 6.7 |
| C | `sticky_offer_v1` — add the offer line to the mobile sticky bar (today it is the only CTA with no offer microcopy) | 4 | 5 | 9 | 6.0 |
| D | `signup_google_v1` — demote the Google fake door below the email field | 5 | 4 | 8 | 5.7 |
| E | `hero_cta_label_v1` — CTA wording test | 3 | 5 | 9 | 5.7 |

**Why A wins**

1. **It is the only candidate that removes a hard block rather than nudging a preference.**
   B, C, D and E move persuasion; A moves people who already decided and were refused. Baymard's
   usability testing names this exact failure mode — "users with atypical but entirely valid
   e-mail addresses are blocked by overly sensitive validators that effectively prevent them from
   finishing", and recommends a warning over a block where certainty is impossible
   ([Baymard, *Validations vs Warnings*](https://baymard.com/blog/validations-vs-warnings))
   `[benchmark — research-institute qualitative, not a lift number]`.
2. **Its effect size is measurable before a line of code is written.** The control arm's ceiling
   is already flowing into PostHog as
   `signup_field_errored {error_code: 'unsupported_email_domain'}`. No other candidate on this
   list can be pre-sized from shipped data (§5). That is what buys Confidence 8 on an idea whose
   published evidence is otherwise thin.
3. **Its evidence is the least vendor-contaminated in the set.** The runner-ups lean on agency
   case studies (Pelagic +25.45%, Hubstaff 6.89%→10.95%, a "Trusted by" logo strip +28%) that are
   self-reported, single-site, and not isolated to one element
   ([Apexure](https://www.apexure.com/blog/a-b-testing-case-studies-with-actual-lift-percentages),
   [Unbounce](https://unbounce.com/a-b-testing/conversion-lift-in-signups/))
   `[benchmark — vendor/agency case studies, treat as directional only]`. D is worse: there is
   **no published test of *removing* social login**; everything measures adding it, and it comes
   from Google's own case-study page
   ([Google Identity case studies](https://developers.google.com/identity/sign-in/case-studies))
   `[benchmark — first-party vendor]`.
4. **D also has near-zero external validity here.** The Google button is a labelled demo fake
   door by design. Testing its position teaches us about our own scaffolding, not about FX Replay.
5. **E collides with `hero_offer_v1`.** Both are hero-copy levers on the same surface for the
   same visitor; running them together makes two copy tests interact on one paragraph.
6. **B and C are cheap and real, and stay on the backlog.** C in particular is a genuine finding:
   the mobile sticky CTA is the only CTA rendered without the risk-reversal microcopy that §C.2 of
   the main brief calls the biggest zero-cost lever, so it is **absent from the CTA most mobile
   visitors see**, and 79% of SaaS landing-page traffic is mobile
   ([Unbounce, Q4 2024 data](https://unbounce.com/average-conversion-rates-landing-pages/))
   `[benchmark]`. It lost on expected size, not on merit.

**Boring-lever disclosure, as asked:** A is boring. It is a validation-rule change with no
visual design in it. It wins because its mechanism is arithmetic rather than psychological, and
because we can check the size of the prize before spending a day on it.

---

## 3. The hypothesis

**`experiment_key`: `signup_email_gate_v1`** (surface `signup` / lever `email_gate` / version 1;
no collision with `hero_offer_v1`).

> **Hypothesis.** We believe that **accepting any syntactically valid, non-disposable email
> address instead of a 43-domain allowlist** for **visitors who reach `/signup`** will cause
> **more `account_created` per `signup_viewed`** because **the allowlist hard-blocks a segment of
> willing signups with no recovery path, and usability research finds that over-strict validators
> "effectively prevent" such users from completing rather than merely slowing them down
> ([Baymard](https://baymard.com/blog/validations-vs-warnings)) — a warning is the correct
> pattern where certainty is impossible.**

**What we expect to be true if it works:** the
`signup_field_errored {error_code: 'unsupported_email_domain'}` rate goes to ~0 in the treatment
arm, and roughly that same share appears as extra conversions, minus the people who in control
simply retyped a Gmail address and converted anyway.

**The trade-off, named out loud.** The allowlist exists to keep temp-mail out with no blocklist
to maintain (`decisions.md` › Bots and email quality). Relaxing it trades lead quality for volume.
Vendor guidance puts mis-set email verification at a 5–15% conversion swing in either direction
([BounceZero](https://bouncezero.io/blog/integrate-email-verification-signup))
`[benchmark — vendor blog, unverifiable]`; that number is not a forecast, it is a reminder that
this lever cuts both ways. The guardrails in §4 are how we detect the bad side.

---

## 4. Measurement

**Primary (powered on): `signup_viewed` → `account_created`**, unique visitors, by variant.
Chosen over the headline metric because the experiment can only affect people who reached the
form; powering on landing→`account_created` dilutes the effect by the landing→signup rate and
inflates the sample need ~6×.

**Primary (reported, not powered on): `landing_page_viewed` → `account_created`**, the existing
headline. Expect it to move in the same direction and not reach significance. Say so in advance.

**Guardrails** — any of these tripping kills the variant regardless of the primary:

| Guardrail | Reads from | Trip condition |
|---|---|---|
| Disposable share of conversions | `account_created.email_domain_type = 'disposable'` | treatment > control + 5 pp absolute, or > 2× control |
| Bot share | `account_created.is_suspected_bot` | treatment materially above control |
| Post-signup engagement (lead-quality proxy) | `profile_updated` ÷ (`profile_updated` + `profile_skipped`) | treatment > 10 pp below control |
| API failures | `signup_failed {error_code, http_status}` | any increase in treatment |

**Secondary / diagnostic**

- Block rate: unique visitors with `signup_field_errored {error_code:'unsupported_email_domain'}`
  ÷ unique `signup_viewed`. Must fall to ~0 in treatment. **This is also the sanity check that the
  variant actually shipped.**
- `signup_started` → `signup_submitted`.
- Distribution of `signup_submitted.attempt_n` (control should show more retries).
- `account_created.email_domain_type = 'corporate'` share — the new segment.
- Which domains are being blocked: not diagnosable today (§1.3).

**Dashboard cuts:** primary and guardrails broken by variant × {`device_type`, `country`,
last-touch `utm_source`, `signup_viewed.entry_point`}. **Country is the cut that matters most** —
the allowlist covers Gmail/Outlook/Yahoo/iCloud well in the US and Western Europe and badly in
Brazil, Poland, Czechia, India and Korea, so the effect should be strongly geo-concentrated. If it
is not, suspect the instrumentation before believing the result.
Gmail penetration is reported at 82.4% in India and 52.9% in Brazil by one methodology and 95.7%
/ 90.8% by another ([sci-tech-today roundup, 2025](https://www.sci-tech-today.com/stats/gmail-statistics-updated/))
`[benchmark — recycled secondary sources with wildly divergent methods; directional only]`, which
is precisely why the residual share must be measured here, not assumed.

---

## 5. Sizing — and the gate that decides whether to run at all

**Stated assumptions (I have no traffic data for this build):** 1,000 landing sessions/day
(carried over from `growth-research.md` §E.0 so the two docs stay comparable), 15%
landing→`signup_viewed`, so **~150 signup views/day**; baseline `signup_viewed` →
`account_created` = **60%**. All three are assumptions, not measurements.

Two-proportion test, 95% two-sided, 80% power, `n per arm ≈ 16·p(1−p)/Δ²`. Here Δ = *r*, the
share of signup viewers who are hard-blocked in control **and never convert**.

| *r* (recoverable blocked share) | Δ | n / arm | total signup views | days @150/day |
|---|---|---|---|---|
| 6% | 0.060 | ~1,070 | ~2,140 | **~15** |
| 4% | 0.040 | ~2,400 | ~4,800 | ~32 |
| 2% | 0.020 | ~9,600 | ~19,200 | ~128 — **do not run** |

**Pre-flight gate — do this before building anything.** *r* is already in PostHog:

```
r ≈  unique visitors with signup_field_errored{error_code='unsupported_email_domain'}
     AND no account_created
     ÷ unique visitors with signup_viewed        (app_env=production, bots excluded)
```

- **r ≥ 4%** → worth running.
- **2% ≤ r < 4%** → the A/B test is not powerable in a sane window. Recommend a **sequential
  rollout with a pre-registered stopping rule** on the disposable guardrail, plus reviewing the
  blocked domains by hand — not a fake underpowered test.
- **r < 2%** → the allowlist is not costing us anything measurable. Drop this experiment, move to
  candidate B or C, and record the number.

Run for whole weeks only, minimum 14 days, so weekday/weekend and paid-flight cycles both land in
both arms.

---

## 6. Kill criteria and what makes it inconclusive

**Kill early (check daily from day 3):**
- Disposable share of `account_created` in treatment exceeds control by >5 pp absolute or 2×.
- Any rise in `signup_failed`, or in `account_created.is_suspected_bot`.
- `signup_field_errored{unsupported_email_domain}` does **not** fall to ~0 in treatment —
  the variant is not actually live; stop, fix, restart the clock.

**Inconclusive / do not ship on it:**
- **SRM:** bucket split deviates from 50/50 by more than ~1 pp at p<0.001. Likely cause here is
  the consent censoring in §1.1, which filters the client denominator non-randomly.
- The pre-flight *r* came in under ~4% (§5) and the test was run anyway.
- Fewer than 14 days, or fewer than ~2,100 signup views total.
- The lift is not concentrated in the geographies the allowlist under-serves. That pattern would
  mean something other than the domain rule moved, and the result should not be attributed to it.
- **`hero_offer_v1` interaction:** the two tests are orthogonal surfaces (hero copy vs. email
  validation), so the marginals are valid. The 2×2 cells are ~25% of traffic each and are
  **not** powered — report them for a smell test, never as a finding.

**What would change the recommendation entirely:** if the pre-flight shows most blocked visitors
retry with a Gmail address and convert anyway, the allowlist is an annoyance rather than a leak,
and the top of the backlog becomes candidate C (offer microcopy on the mobile sticky CTA), with
the §1.1 consent measurement defect ahead of both.

---

## 7. What I could not verify

- **FX Replay's real signup form is still unobservable.** `app.fxreplay.com/auth/signup` returns a
  client-rendered shell with no form markup — re-fetched 2026-09-18, same result as in the main
  brief. Whether the real product restricts email domains is unknown. `[observed — as a negative]`
- **No traffic data exists for this build.** Every runtime in §5 is conditional on the stated
  1,000 sessions/day.
- **No published A/B test exists for removing an email-domain allowlist.** The evidence for A is a
  usability-research mechanism (Baymard) plus arithmetic on our own shipped event — not a
  replicated lift. Said plainly rather than dressed up.
- **Per-country webmail-domain share is not publicly available** at the granularity this rule
  needs; the Gmail-penetration figures cited are recycled secondary sources that disagree with
  each other by 40 percentage points depending on method.

---

### Sources

- [Baymard Institute — Form Usability: Validations vs Warnings](https://baymard.com/blog/validations-vs-warnings) · [Usability Testing of Inline Form Validation](https://baymard.com/blog/inline-form-validation) · [How to Improve Validation Errors](https://baymard.com/blog/adaptive-validation-error-messages)
- [Zuko — Which form fields cause the biggest UX problems](https://www.zuko.io/blog/which-form-fields-cause-the-biggest-ux-problems) · [Zuko — form benchmarking by industry](https://www.zuko.io/benchmarking/industry-benchmarking)
- [BounceZero — email verification at signup without killing conversion](https://bouncezero.io/blog/integrate-email-verification-signup) *(vendor)* · [MillionVerifier — blocking disposable emails without killing conversions](https://www.millionverifier.com/blog/how-to-block-disposable-emails-in-saas-signups-without-killing-conversions/) *(vendor)*
- [Google Identity — Sign in with Google case studies](https://developers.google.com/identity/sign-in/case-studies) *(first-party vendor)* · [il.ly — Sign in with Google A/B test](https://il.ly/blog/google-signin) *(n=1)*
- [Apexure — A/B testing case studies with lift percentages](https://www.apexure.com/blog/a-b-testing-case-studies-with-actual-lift-percentages) *(agency)* · [Unbounce — 31.54% lift in signups](https://unbounce.com/a-b-testing/conversion-lift-in-signups/) *(vendor)*
- [Unbounce — Average landing page conversion rates (Q4 2024 data)](https://unbounce.com/average-conversion-rates-landing-pages/)
- [sci-tech-today — Gmail statistics by country (2025)](https://www.sci-tech-today.com/stats/gmail-statistics-updated/) *(recycled secondary)*
- Fetched 2026-09-18: `app.fxreplay.com/auth/signup` (client-rendered shell, no form markup).
