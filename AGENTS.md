# Repository Rules

- Run formatting, linting, type checking, and tests after meaningful changes.
- Repair failures before moving to the next milestone.
- Never commit credentials.
- Never enable automatic sending by default.
- Never claim that a live integration works until tested with a real Kommo incoming Instagram message.
- Keep external integrations behind typed service interfaces.
- Use fixtures for all external payloads.
- Preserve idempotency and duplicate protection.
- Keep business knowledge editable rather than hard-coded.
