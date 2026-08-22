# AGENTS.md

This repository (`sonarcloud-ai`) is a multi-project workspace. The primary, actively-developed
product is the **Be My Guest dinner-party app** under `emdash/worktrees/dinner_party`.

## Projects

| Path | Stack | Notes |
| --- | --- | --- |
| `emdash/worktrees/dinner_party` | Next.js 16 (Turbopack), Prisma + PostgreSQL, NextAuth, Stripe, Vitest | Primary app. Public event/RSVP/reserve pages + `/admin` dashboard. |
| `morningannounce` | Vite + React (shadcn) frontend + Express (`server.js`) | "Voice Recorder / Morning MiniPod". API server needs external keys (OpenAI/ElevenLabs/Supabase). |
| `sugar-city` | Next.js (partial) | Only a subset of files is tracked (no `package.json`); not runnable standalone here. |

Standard commands live in each project's `package.json` `scripts` — use those rather than
duplicating them.

## Cursor Cloud specific instructions

### Environment gotchas (apply to all Node apps here)

- **`NODE_ENV=production` is injected into every session.** Plain `npm install` therefore skips
  `devDependencies` (eslint, vitest, tailwind, types, etc.), which breaks lint/test/build. Always
  install with `npm install --include=dev` (the update script already does this for both apps). For
  the dev servers, prefer running with `NODE_ENV=development` in that shell.
- **An injected `DATABASE_URL` secret points at a shared Neon Postgres** (used by other repo
  tooling). Do **not** let `dinner_party` use it for local dev — running against it would mutate
  shared data. Override it with the local database (see below). Next.js/Prisma prefer real
  environment variables over `.env`, so you must `export` the local values in the shell that runs
  the dev server / prisma commands.

### dinner_party (primary app)

Requires a local PostgreSQL. It is installed via apt (`postgresql` 16) and its data dir is part of
the VM. On a fresh boot, start the cluster and make sure the dev DB/role exist:

```bash
sudo pg_ctlcluster 16 main start
# One-time (idempotent) role + db, if missing:
sudo -u postgres psql -c "CREATE ROLE dinner LOGIN PASSWORD 'dinner';" 2>/dev/null || true  # pragma: allowlist secret
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='dinner_party'" | grep -q 1 || sudo -u postgres createdb -O dinner dinner_party
```

Local connection string (override the injected Neon secret). The credentials below are a
throwaway localhost dev role, not a real secret:

```bash
export DATABASE_URL="postgresql://dinner:dinner@127.0.0.1:5432/dinner_party?schema=public"  # pragma: allowlist secret
export DIRECT_URL="$DATABASE_URL"
```

A local `.env` (gitignored) in the project holds the same local URLs plus `NEXTAUTH_SECRET`,
`NEXTAUTH_URL`, and placeholder Stripe test keys. Prisma CLI reads `.env`; the running Next app
needs the `export`s above.

Schema + seed (idempotent):

```bash
cd emdash/worktrees/dinner_party
npx prisma db push
npx --yes tsx prisma/seed.ts   # `npm run db:seed` fails: tsx is not a declared dependency
```

Seed creates admin `admin@dinnerparty.local` / `admin123` and a published event `summer-sunset`.

Run / verify (see `package.json` scripts): `npm run dev` (port 3000), `npm run lint`,
`npm run typecheck`, `npm run build`.

- **Stripe** is lazy-initialized; admin CRUD and RSVP creation work with placeholder keys. Real
  checkout/payment redirects need genuine `sk_test_*` / `pk_test_*` keys.
- **Known pre-existing bug (not an env issue):** the Vitest suite fails because `vitest.config.ts`
  sets `DATABASE_URL="file:./test.db"` (SQLite) while `prisma/schema.prisma` uses
  `provider = "postgresql"`, so `prisma db push` in `tests/global-setup.ts` errors with a
  protocol-validation failure. Fixing it requires code changes (e.g. a Postgres test DB URL).

### morningannounce

`npm run dev` starts the Vite frontend on port 8080 and proxies `/api` to the Express server on
port 3000 (`npm start` / `node server.js`). The Express endpoints call OpenAI/ElevenLabs/Supabase
and need those secrets configured; the frontend renders without them.
