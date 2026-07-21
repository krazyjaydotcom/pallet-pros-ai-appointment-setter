# Kommo setup

Use these URLs for the current DigitalOcean deployment:

- OAuth start/login URL: `https://pallet-pros-dm-bot-c5fjg.ondigitalocean.app/api/kommo/oauth`
- OAuth callback / redirect URL: `https://pallet-pros-dm-bot-c5fjg.ondigitalocean.app/api/kommo/oauth/callback`
- Incoming webhook URL: `https://pallet-pros-dm-bot-c5fjg.ondigitalocean.app/api/kommo/webhook`

## What to enter in Kommo

1. Create or edit the private integration in Kommo.
2. Copy the Kommo **Integration ID** into `KOMMO_CLIENT_ID`.
3. Copy the Kommo **Secret key** into `KOMMO_CLIENT_SECRET`.
4. Set the integration **Redirect URI** to the callback URL above.
5. Add the webhook URL above and enable the incoming message event.

## What to set in DigitalOcean

Set these environment variables on the app:

- `KOMMO_SUBDOMAIN`
- `KOMMO_CLIENT_ID`
- `KOMMO_CLIENT_SECRET`
- `KOMMO_REDIRECT_URI`

If you want the app to drive the Kommo authorization flow, open the OAuth start URL above. It will redirect you to Kommo, capture the authorization code, exchange it for tokens, and store them in the app settings.

## How to confirm it is working

- A successful OAuth callback redirects back to the Communication Profile page with `?kommo=connected`.
- A webhook POST creates or updates a conversation row in the dashboard.
- If the webhook route is hit with the same event twice, the duplicate is ignored.
