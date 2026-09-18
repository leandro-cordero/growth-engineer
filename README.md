# Try FX Replay Free

[![Unit tests](https://github.com/leandro-cordero/growth-engineer/actions/workflows/unit-tests.yml/badge.svg?branch=master)](https://github.com/leandro-cordero/growth-engineer/actions/workflows/unit-tests.yml)
[![Typecheck](https://github.com/leandro-cordero/growth-engineer/actions/workflows/typecheck.yml/badge.svg?branch=master)](https://github.com/leandro-cordero/growth-engineer/actions/workflows/typecheck.yml)
[![Build](https://github.com/leandro-cordero/growth-engineer/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/leandro-cordero/growth-engineer/actions/workflows/build.yml)
[![JS budget](https://github.com/leandro-cordero/growth-engineer/actions/workflows/js-budget.yml/badge.svg?branch=master)](https://github.com/leandro-cordero/growth-engineer/actions/workflows/js-budget.yml)
[![Audit](https://github.com/leandro-cordero/growth-engineer/actions/workflows/audit.yml/badge.svg?branch=master)](https://github.com/leandro-cordero/growth-engineer/actions/workflows/audit.yml)

A marketing landing page, a signup flow and a Users API for the FX Replay Growth Engineer
challenge.

- **Live:** https://growth-engineer-plum.vercel.app/
- **Brief:** [`instructions/Growth Engineer Challenge.md`](instructions/Growth%20Engineer%20Challenge.md)

> **Auth is simulated.** Signup collects an email only; there is no password and no login.
> "Continue with Google (demo)" is a labelled fake door that creates no user.
> The signup counter in the `counter` experiment variant is simulated.

---

## Routes

| Route | What it is |
|---|---|
| `/` | Landing page. Prerendered, zero React |
| `/signup` | Signup page. Prerendered, one React island (`SignupForm`) plus an optional profile step |
| `POST /api/users` | Create a user. Takes an `Idempotency-Key` header; email must be unique and from an allowlisted provider (Gmail, Outlook, iCloud… see `src/lib/users/email.ts`) |
| `GET /api/users` | List users. Bearer `USERS_ADMIN_TOKEN` (open in dev when unset) |
| `PATCH /api/users/:id` | Update the profile |
| `/v/counter/*` | Variant copies of `/` and `/signup`, reached only through the middleware rewrite |

## Stack

Astro 7 · React 19 islands · TypeScript strict · Zod 4 · Tailwind v4 ·
PostHog (`posthog-js` + `posthog-node`) · Upstash Redis · Vercel.

## Run it locally

Requires Node 24 and pnpm.

```bash
pnpm install
cp .env.example .env   # every key is optional
pnpm dev               # http://localhost:4321
```

With no env set, everything still runs: the Users API uses an in-memory store (resets on
restart), analytics is a no-op, and `GET /api/users` is open. Each key is explained in
[`.env.example`](.env.example).

| Command | Does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm test` | Vitest unit tests (`src/lib/**/*.test.ts`) |
| `pnpm build` | `astro check` (typecheck) + production build |
| `pnpm preview` | Serve the build |

Before opening a PR: `pnpm test && pnpm build`. CI runs one workflow per check
(`.github/workflows/`): unit tests, typecheck, build, landing JS budget (≤ 20KB gz) and
`pnpm audit`.

## Try it

```bash
# Create a user
curl -X POST http://localhost:4321/api/users \
  -H 'Content-Type: application/json' \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"email":"trader.test@gmail.com"}'

# List users (add -H "Authorization: Bearer $USERS_ADMIN_TOKEN" if the token is set)
curl http://localhost:4321/api/users
```

Force an experiment variant outside production with `?fxr_variant=control` or
`?fxr_variant=counter` (e.g. `http://localhost:4321/?fxr_variant=counter`).

## Project layout

```
src/
  pages/            index, signup, v/counter/*, api/users/*
  components/       landing/ (Astro only) · signup/ (React island)
  lib/              framework-free, tests next to each file
    analytics/      events.ts (event map) · client.ts · server.ts
    experiments/    bucket.ts (assignment) · edge.ts (variant routing)
    users/          schema · store (memory | redis) · service · handlers
    signup/         browser client for /api/users, error messages
  styles/           tokens.css (brand kit) · global.css · components.scss
middleware.ts       Vercel Routing Middleware (production)
src/middleware.ts   same logic for `astro dev`
vercel.json         /rly/* → PostHog proxy
docs/               analytics plan, experiment proposal, decisions, research
CLAUDE.md, .claude/ Claude Code instructions, agents and skills
```

## Deploy

The project deploys to Vercel with the `@astrojs/vercel` adapter. Set the variables from
`.env.example` in the Vercel project; in production set `PUBLIC_POSTHOG_HOST=/rly` to use the
same-origin proxy.
