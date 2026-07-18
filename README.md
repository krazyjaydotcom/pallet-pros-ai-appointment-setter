# Pallet Pros Academy AI Appointment Setter

Approval-first Kommo + OpenAI scaffold for Pallet Pros Academy.

## What’s in here

- Next.js App Router dashboard
- Kommo webhook intake route
- Worker process for queued message handling
- Prisma schema for all durable records
- Editable knowledge base and communication profile surfaces
- Mock fixtures and tests for policy logic

## Open the dashboard

```bash
npm run dev:web
```

Then open `http://localhost:3000`.

## Test a mocked incoming DM

The scaffold includes mock Kommo payloads in `packages/core/src/fixtures/kommo.ts` and a webhook route at `/api/kommo/webhook`. You can POST the mock payload to that route to simulate a received Instagram DM without touching a live Kommo account.

## Review the Codex changes

Look through the repo docs first:

- `SPEC.md`
- `PLAN.md`
- `STATUS.md`
- `docs/ARCHITECTURE_DECISION.md`
- `docs/KOMMO_SETUP.md`

## Operating modes

- `LOG_ONLY`
- `APPROVAL_ONLY` (default)
- `LIMITED_AUTO_SEND`
- `FULL_AUTO_SEND` (kept disabled by default)

## Local development

```bash
npm install
npm run generate -w @pallet-pros/db
npm run dev:web
```

Run the worker in another terminal:

```bash
npm run dev:worker
```

## Validation

```bash
npm run lint
npm run typecheck
npm run test
```

## Docker

Use `docker compose up --build` after setting environment variables.

## Important notes

- Automatic sending stays disabled by default.
- Real Kommo and OpenAI credentials are required for live integration.
- The repository includes mock payloads and placeholders so development can continue without live access.
- A live Instagram DM test in the owner’s Kommo account is still required before any live-send claim.
- In development, if `ADMIN_PASSWORD_HASH` is not set, you can sign in with the fallback `DEV_ADMIN_EMAIL` and `DEV_ADMIN_PASSWORD` values from `.env.example`.
