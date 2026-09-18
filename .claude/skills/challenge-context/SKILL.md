---
name: challenge-context
description: Load the "Try FX Replay Free" challenge context before planning. Use before creating a plan, proposing an approach, scoping a feature or experiment, or checking work against the brief. Reads the challenge spec, the growth research, and the project structure.
---

# Challenge context

Do this before any plan, approach or scope proposal. Don't plan from memory.

## 1. Read

1. `instructions/Engineer Challenge.md`: what gets graded. Landing, signup,
   Users API (create/update/list), analytics taxonomy + funnel, performance, SEO,
   a11y, infrastructure. Includes "small but production-minded".
2. `docs/research/growth-research.md`: start with §0 (bottom line), then read the
   sections the task touches:
   - copy / offer / proof → §A.3, §C.2–C.4
   - signup friction → §B.3–B.4, §C.5, §E.2, §E.5
   - analytics → §D (taxonomy D.2, identity D.3, data quality D.4)
   - experiments / prioritisation → §E, §F
3. **Project structure** in `CLAUDE.md` §7. Then open the files the plan will
   touch so the plan matches the code as it is now.
4. `docs/decisions.md`: the headings for the area involved. Don't reopen a
   decision that's already recorded without saying why.

## 2. Ground the plan

Every plan must include:

- **Spec coverage**: which challenge requirements it serves (quote the heading).
- **Evidence**: which research findings it relies on (cite `§X.n`), and whether
  each one is `[observed]`, `[benchmark]` or `[hypothesis]` in the brief.
- **Fit**: the existing files and modules it extends, per §7. Flag any new folder,
  dependency or abstraction.

If the research and the spec disagree, the spec wins. Say so.
