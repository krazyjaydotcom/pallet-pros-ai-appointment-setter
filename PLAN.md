# Implementation Plan

## Milestone 1: Research and architecture
- Deliverables: architecture decision, durable docs, repo scaffold.
- Validation commands: repo inspection, doc review.
- Tests: none yet.
- Completion status: complete.
- Architectural decisions: hybrid Kommo intake + Salesbot/private chatbot outbound path.
- Known risks: live Kommo plan/permissions need confirmation.

## Milestone 2: Application foundation
- Deliverables: Next.js app, Prisma, Redis, auth, Docker, base settings.
- Validation commands: install, build, typecheck, lint.
- Tests: core unit tests and basic page rendering.
- Completion status: scaffolded and validated.
- Architectural decisions: monorepo with shared core and worker package.
- Known risks: local runtime availability, Prisma client generation.

## Milestone 3: Event intake
- Deliverables: webhook handlers, Kommo service abstraction, queue, debounce, locking, fixtures.
- Validation commands: webhook unit tests and queue tests.
- Tests: duplicate event handling, debounce, lock contention, retry safety.
- Completion status: scaffolded.
- Architectural decisions: intake through typed adapters and BullMQ jobs.
- Known risks: exact Kommo payload shape must be confirmed in a live account.

## Milestone 4: AI decision engine
- Deliverables: Responses API wrapper, structured outputs, policy enforcement, usage tracking.
- Validation commands: unit tests for policy and schema parsing.
- Tests: low-confidence, expired-window, escalation categories, mocked OpenAI failures.
- Completion status: scaffolded and partially validated.
- Architectural decisions: one model call per normal response.
- Known risks: response schema may need refinement once real outputs are observed.

## Milestone 5: Knowledge base
- Deliverables: editable KB, versioning, publishing, retrieval, approved examples, communication profile.
- Validation commands: service tests and seed checks.
- Tests: published-only retrieval, archived exclusion, version restore.
- Completion status: scaffolded and partially validated.
- Architectural decisions: editable content drives live prompts.
- Known risks: ranking strategy may need iteration after usage.

## Milestone 6: Dashboard
- Deliverables: approval queue, conversation view, editors, playground, usage/error views.
- Validation commands: Playwright flow smoke checks.
- Tests: approve/edit/takeover workflows.
- Completion status: scaffolded.
- Architectural decisions: dashboard-first operational workflow.
- Known risks: component polish may need follow-up passes.

## Milestone 7: Sending layer
- Deliverables: controlled send interface, mock sending, idempotency, final-window checks.
- Validation commands: send-path tests and integration fixtures.
- Tests: idempotent send, duplicate loop prevention, auto-send disabled by default.
- Completion status: scaffolded.
- Architectural decisions: outgoing path stays behind explicit operator action.
- Known risks: Kommo send API shape must be verified live.

## Milestone 8: Verification and documentation
- Deliverables: formatting, linting, type checking, tests, README, setup docs, status update.
- Validation commands: full repo checks.
- Tests: all available automated tests.
- Completion status: pending final polish.
- Architectural decisions: document remaining live-account setup clearly.
- Known risks: environment variables, live token exchange, and actual Instagram DM testing.
