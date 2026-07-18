import { NextResponse } from "next/server";
import {
  exchangeKommoToken,
  fetchKommoAccount,
  saveKommoCredential
} from "@/src/lib/kommo-store";

function renderPostback(message: string, closeWindow = false) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kommo connection</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
      }
      main {
        max-width: 520px;
        background: #111827;
        border: 1px solid #334155;
        border-radius: 20px;
        padding: 28px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      }
      h1 {
        font-size: 24px;
        margin: 0 0 12px;
      }
      p {
        margin: 0 0 10px;
        line-height: 1.6;
        color: #cbd5e1;
      }
      code {
        background: #1e293b;
        color: #93c5fd;
        padding: 2px 6px;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Kommo connected</h1>
      <p>${message}</p>
      <p>You can close this tab now.</p>
    </main>
    <script>
      try {
        if (window.opener) {
          window.opener.postMessage({ type: "kommo-oauth", ok: true }, "*");
        }
        ${closeWindow ? "window.close();" : ""}
      } catch (error) {}
    </script>
  </body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const referer = url.searchParams.get("referer");
  const state = url.searchParams.get("state");

  if (error) {
    return NextResponse.json({
      ok: false,
      error,
      referer,
      state
    });
  }

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  const exchange = await exchangeKommoToken({
    code,
    grantType: "authorization_code"
  });

  const subdomain = process.env.KOMMO_SUBDOMAIN ?? "";
  const account = await fetchKommoAccount(exchange.access_token, subdomain);
  const expiresAt = new Date(Date.now() + exchange.expires_in * 1000);

  await saveKommoCredential({
    accountId: String(account.id),
    subdomain: account.subdomain ?? subdomain,
    accessToken: exchange.access_token,
    refreshToken: exchange.refresh_token,
    expiresAt
  });

  return renderPostback(
    `The integration was authorized for <code>${account.subdomain ?? subdomain}</code> and saved locally in the app.`,
    true
  );
}
