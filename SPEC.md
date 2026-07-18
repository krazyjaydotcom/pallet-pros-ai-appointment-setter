# Pallet Pros Academy AI Appointment Setter

## Product Goals
- Receive Kommo-delivered Instagram DM events.
- Debounce back-to-back lead messages.
- Classify messages, retrieve knowledge-base context, and propose concise replies.
- Keep human approval first by default.
- Allow a controlled path to limited auto-send later.

## Non-Goals
- No live sending during this overnight build.
- No computer-use automation.
- No browser polling loop for inbox monitoring.
- No hard-coded business knowledge outside the editable knowledge base.

## Hard Restrictions
- Default mode is `APPROVAL_ONLY`.
- `FULL_AUTO_SEND` must stay disabled by default.
- Do not depend on an always-on Codex session.
- Do not claim live Kommo success without a real Instagram DM test.
- Do not commit secrets.
- Do not send real messages in this task.

## User Roles
- Administrator: manages settings, knowledge base, approvals, and send controls.
- Owner/manager: reviews AI proposals and approves or edits replies.
- Worker: processes webhook events and queued jobs.

## Required Workflows
- Receive Kommo event.
- Validate and store raw event.
- Debounce and deduplicate.
- Load lead context and knowledge-base matches.
- Generate a structured AI decision.
- Surface the proposal in the dashboard.
- Approve, edit, reject, or take over.
- Optionally send later in a tightly controlled mode.

## Acceptance Criteria
- Web app boots locally.
- Webhook intake is implemented behind typed interfaces.
- Worker and queue flow exist.
- Knowledge base is editable.
- Proposed responses are generated in approval mode.
- Messaging-window restrictions are enforced server-side.
- Tests cover the critical policy paths.

## Definition Of Done
- The repo contains a maintainable scaffold, docs, tests, and deployment prep.
- Live Kommo and OpenAI credentials remain external setup items.
- Automatic sending remains disabled.
