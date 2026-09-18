# Experiment brief — `signup_proof_v1`
**Date:** 2026-09-18
**Builds on:** `docs/research/growth-research.md` (teardown, benchmarks and ICE backlog are not
repeated here). This brief replaces `exp-signup-email-gate-v1` (removed; see §2.1 for why).
**Objective served:** marketing traffic → **account creation**.
**Deliverable version:** `docs/experiment-proposal.md` (spec format). This file is the evidence behind it.

Evidence tiers: `[observed]` = I read the page or file · `[benchmark]` = published data, source
+ date · `[hypothesis]` = my inference · `[documented]` = specified in `docs/decisions.md` but
**not yet in this repo's code** (on 2026-09-18 `src/` held only a placeholder page), so it
describes the build as designed, not as verified.

---

## 1. The leak this targets

The landing page does the persuading: offer microcopy at every CTA, proof, a replay chart.
`/signup` is a single-purpose form (email + "Continue with Google (demo)") `[documented]`.
The visitor who clicks through **leaves every piece of reassurance behind** on the page they
came from, and meets the commitment point — the submit button — with nothing next to it except
the offer line `[documented: decisions.md › Experiment handoff]`.

Why that is the right place to intervene:

- Form completion is the leakiest high-baseline step: only ~45–52% of people who reach a form
  complete it ([Zuko](https://www.zuko.io/benchmarking/industry-benchmarking)) `[benchmark]`.
- This audience's objection at the button is credibility, not effort: "is this legit, will this
  spam me, is it another signal-seller?" (growth-research §C.3, §C.4) `[hypothesis]`.
- Proof by behavioural scale is the second most credible format for sceptical traders and the
  most compliant one — it makes no outcome claim (growth-research §C.3) `[hypothesis]`.
  FX Replay publishes "1M+ traders" on its home page (growth-research §A.2) `[observed]`.

## 2. Candidate shortlist, re-ranked

Rule: one or two components, variant B against the shipped version as A, no collision with
`hero_offer_v1` (landing hero offer, `control` vs `trial`).

| Candidate | Verdict | Why |
|---|---|---|
| **`signup_proof_v1`** — proof line under the `/signup` submit | **Run** | Different surface and mechanism from `hero_offer_v1`; measurable with existing events; near-zero build cost. |
| `signup_email_gate_v1` — allowlist → disposable blocklist | Don't test (§2.1) | Policy fix, not an experiment. |
| `sticky_offer_v1` — offer line on the mobile sticky CTA | Ship as a fix | The line's text is whatever `hero_offer_v1` assigned, so it can't be tested independently; and CLAUDE.md §5 already requires the offer "worded identically at every CTA". |
| `signup_google_v1` — demote the Google fake door | Drop | Tests our own demo scaffolding; the result wouldn't transfer to FX Replay. |
| `hero_cta_label_v1` — CTA wording | Drop | Same hero surface and visitor as `hero_offer_v1`; two copy tests on one paragraph. |

### 2.1 Why the email gate lost before any traffic

1. **Its own pre-flight gate can't pass.** It needed ≥4% of signup viewers hard-blocked and never
   converting. There is no traffic to compute it, and retail traders nearly all hold a
   Gmail/Outlook/iCloud address to retype, so ~1–3% is the realistic range `[hypothesis]` —
   below its own run threshold.
2. **Its guardrail was circular.** Treatment = "block a disposable list"; guardrail =
   `email_domain_type = 'disposable'` from the same kind of bundled list. A temp-mail domain the
   list misses is invisible to both.
3. **It's a policy decision with a known answer.** `decisions.md` › Bots and email quality
   already names the blocklist as the upgrade path, and the Baymard evidence it cited
   ([Validations vs Warnings](https://baymard.com/blog/validations-vs-warnings)) argues for a
   warning over a block — a design rule, not a hypothesis. Decision recorded in `decisions.md`.

## 3. The hypothesis

> **We believe** that adding one line of substantiated proof directly under the submit button on
> `/signup` **for visitors who reach the signup form** will cause **more `account_created` per
> `signup_viewed`** **because** the submit button is where doubt peaks, the landing page's
> reassurance is no longer on screen at that moment, and proof by behavioural scale is the most
> credible claim we can make to this audience without an outcome claim.

- **A (control):** the shipped form, unchanged.
- **B (variant):** the same form plus, directly under the submit button:
  **"Join 1M+ traders on FX Replay."**
  Source comment in code: `// fxreplay.com home, "1M+ traders", observed 2026-09-18`.
  Nothing else changes: same offer line, fields, layout, button label.
- **Copy review (`copy-compliance`):** passes C1/C3 (no outcome claim), C4 (FX Replay's published
  figure, sourced), C6 (a standing total, not "N signed up today"), C9 (no "#1/best/only").
  Rejected alternative: "Join 1M+ traders practising on replayed markets" — it asserts what the
  1M *do*, which the published figure doesn't substantiate.
- **Where the effect should show:** `signup_started → signup_submitted` (the step that happens at
  the button). If B moves only `signup_viewed → signup_started`, something other than the line
  caused it.

## 4. Sizing

Two-proportion, 95% two-sided, 80% power: `n per arm ≈ 16·p(1−p)/Δ²` (growth-research §E.0).
**Stated assumptions, not measurements:** 1,000 landing sessions/day, 15% reach `/signup`
→ **~150 `signup_viewed`/day**; baseline `signup_viewed → account_created` = **60%**.

| Lift on 60% | Δ | n / arm | Total | Days @150/day |
|---|---|---|---|---|
| +10% rel. | 6 pp | ~1,070 | ~2,140 | ~15 → **3 whole weeks** |
| +5% rel. | 3 pp | ~4,270 | ~8,540 | ~57 — don't run as a fixed test |

Copy nudges usually move conversion by less than 10% `[hypothesis]`, so **6 pp is the minimum
detectable effect, declared in advance**. A true 2–3 pp effect will read as inconclusive; that
is the most likely failure mode and is accepted knowingly.


### Sources
- [Zuko — form benchmarking by industry](https://www.zuko.io/benchmarking/industry-benchmarking)
- [Baymard — Validations vs Warnings](https://baymard.com/blog/validations-vs-warnings)
- [Apexure — A/B testing case studies](https://www.apexure.com/blog/a-b-testing-case-studies-with-actual-lift-percentages) *(agency)* · [Unbounce — lift in signups](https://unbounce.com/a-b-testing/conversion-lift-in-signups/) *(vendor)*
- growth-research.md §A.2 (fxreplay.com "1M+ traders", observed 2026-09-18), §C.3, §C.4, §E.0
