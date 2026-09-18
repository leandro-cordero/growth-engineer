# Experiment proposal — `signup_proof_v1`

**Surface:** `/signup` · **Lever:** proof at the submit button · **Status:** proposed, not running.
Evidence and the shortlist it won against: `docs/research/exp-signup-proof-v1.md`.
Measurement plumbing: `docs/analytics-plan.md` §6.

---

## Hypothesis

We believe that adding **one line of substantiated proof directly under the submit button on
`/signup`**, for visitors who reach the signup form, will increase the share of them who create
an account.

**Why:** the submit button is where doubt peaks for this audience ("is this legit? will it spam
me?"), and at that moment the landing page's reassurance is no longer on screen. A proof of
scale is the most credible claim we can make to sceptical retail traders without an outcome
claim (growth-research §C.3–C.4). It acts at the moment of commitment, which the landing
experiment (`hero_offer_v1`) doesn't touch.

## Control

The shipped `/signup` form: email field, "Continue with Google (demo)", the submit button, and
the offer line assigned by `hero_offer_v1` under it. No proof on the page.

## Variant

The same form with one added line directly under the submit button:

> **Join 1M+ traders on FX Replay.**

- Source in a code comment: fxreplay.com home, "1M+ traders", observed 2026-09-18. If the figure
  can't be re-confirmed at build time, it becomes `// TODO(copy): substantiate` and the test
  doesn't start.
- Nothing else changes: same fields, offer line, button label and layout.
- Both lines are prerendered; the inline head script picks the variant before paint, so there
  is no flicker and no layout shift.
- Passed the `copy-compliance` gate: no outcome claim, published figure, no urgency.

## Success metric

**Primary:** unique visitors with `account_created` ÷ unique visitors with `signup_viewed`, by
`$feature/signup_proof_v1`. Production only, suspected bots excluded.

Powered on the signup step, not the headline landing → account metric: the variant can only
affect people who reach the form, and diluting by the landing → signup rate would need ~6× the
sample. The headline metric is reported alongside, expected to move the same way and not
expected to reach significance.

**Mechanism check:** the lift should appear at `signup_started → signup_submitted`. A lift that
shows up only at `signup_viewed → signup_started` is not attributable to the line.

**Guardrails** (any one tripping stops the test):

| Guardrail | Trips when |
|---|---|
| `signup_failed` rate | Higher in the variant |
| `is_suspected_bot` share of `account_created` | Materially higher in the variant |
| Profile completion: `profile_updated` ÷ (`profile_updated` + `profile_skipped`) | Variant > 10 pp below control (proof bought low-intent signups) |
| Sample ratio of `signup_viewed` by variant | Off 50/50 at p < 0.001 |

## Design

- **Assignment:** deterministic hash of `fxr_aid` with its own key, so it's independent of
  `hero_offer_v1`. Exposure = `signup_viewed`.
- **Size** (assumptions, not measurements: ~150 signup views/day, 60% baseline;
  `n ≈ 16·p(1−p)/Δ²`): **minimum detectable effect 6 pp absolute (+10% relative),
  ~1,070 per arm**. At 150/day that's **3 whole weeks** — whole weeks so weekday/weekend and
  paid-flight cycles land in both arms.
- **Fixed horizon, no peeking for a winner.** Guardrails are checked daily from day 3; the
  primary is read once, at the horizon.
- **Prerequisite:** the two-experiment schema (`analytics-plan.md` §5) ships first.

## Decision

Read once at the pre-registered horizon (≥ 1,070 exposures per arm **and** ≥ 3 whole weeks).

| Outcome | Condition | Action |
|---|---|---|
| **Ship the variant** | Primary lift significant at 95% (two-sided), point estimate ≥ +3 pp, no guardrail tripped, and the lift shows at `signup_started → signup_submitted` | Roll out to 100%; keep the line's source comment; record the result |
| **Continue** | Not significant, point estimate ≥ +3 pp, guardrails clean | Extend **once** to 6 weeks (powers ~4 pp). No further extensions |
| **Reject the variant** | A guardrail trips; or the variant is significantly worse; or the point estimate is < +3 pp at the horizon or after the one extension | Keep the control. An unproven line at the decision point is clutter; record the null result |
| **Inconclusive — don't decide** | Sample-ratio failure; horizon not reached; the lift appears only before the form is touched | Fix the cause and restart the clock |

## What if the traffic is lower

Below ~100 signup views/day the fixed test takes over a month. Then: a sequential test with a
pre-registered stopping rule, or qualitative methods (five moderated sessions on `/signup`, an
exit micro-survey) instead of an underpowered A/B (growth-research §E.0).

## Alongside: `hero_offer_v1`

The landing-page offer test (`control` vs `trial` offer wording in the hero,
`docs/decisions.md` › Offer experiment without flicker) runs at the same time on a different
surface and step. Each experiment is bucketed independently, so each one's marginal result is
valid. The four combined cells get about 25% of traffic each and are **not powered**: report
them as a smell test only (for example, if proof helps only under the `trial` offer), never as a
finding.
