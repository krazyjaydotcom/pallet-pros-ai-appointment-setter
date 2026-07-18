# Architecture Decision

## 1. Selected Kommo integration method
We selected a hybrid Kommo approach:

- **Incoming event intake:** Kommo webhooks / digital-pipeline webhooks to receive chat events from the account.
- **Outgoing message delivery:** Kommo **Private Chatbot integration** using Salesbot and `widget_request` to place replies back into the existing native Instagram-connected chat.

## 2. Why it works with an existing native Instagram connection
Kommo’s Private Chatbot guide says Salesbot can be used to send messages from external services into Kommo chat channels, and it specifically notes that this is the common pattern for connecting an LLM service to messages arriving through chat channels. Kommo also states that the Chats API alone does not let a custom channel directly access an existing integration channel the way we need here.

That makes the Salesbot/private-chatbot path the best fit for a native Instagram channel that already exists inside Kommo.

Official references:

- https://developers.kommo.com/docs/private-chatbot-integration
- https://developers.kommo.com/reference/receiving-chat-webhooks
- https://developers.kommo.com/docs/salesbot-dp
- https://developers.kommo.com/reference/send-message-guide

## 3. Required plan or permissions
Based on the official docs, the likely requirements are:

- Admin access to install and configure the integration.
- OAuth 2.0 authorization for the app installation.
- A Kommo plan that supports webhooks.
- For the widget/Salesbot path, at least the plan level that allows WebSDK/custom widgets.

Kommo’s docs indicate webhooks via account settings are available on Advanced, Pro, and Enterprise plans, and the private chatbot integration guide notes that custom widget/WebSDK work requires at least Advanced.

## 4. Remaining live-account uncertainty
These items must be verified against a real account before claiming live support:

- Exact webhook payload fields for incoming Instagram chat events in this account.
- Exact Salesbot / `widget_request` configuration values and UI labels.
- Whether the owner’s Kommo plan includes the needed widget capability.
- Whether the native Instagram channel is already connected in a way that exposes the expected conversation metadata.
- The exact “24-hour window” behavior as enforced in the owner’s Kommo account.

## 5. Fallback if the preferred method is unavailable
If the private-chatbot / Salesbot route is unavailable, the safest fallback is an **approval-only dashboard** that still receives and stores Kommo events, generates proposed replies, and lets a human copy or approve responses manually. If a later integration must be channel-native, a custom Chats API channel could be explored, but Kommo’s docs indicate that it would not directly reuse the existing native Instagram connection the same way.
