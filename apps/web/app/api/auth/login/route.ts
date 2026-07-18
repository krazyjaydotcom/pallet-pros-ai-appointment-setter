import { NextResponse } from "next/server";
import { z } from "zod";
import { safeComparePassword, SESSION_COOKIE } from "@/src/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let body: unknown;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const rawBody = await request.text();
      const formData = new URLSearchParams(rawBody);
      body = {
        email: formData.get("email"),
        password: formData.get("password")
      };
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
    }

    const expectedEmail = process.env.ADMIN_EMAIL ?? "";
    const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
    const devEmail = process.env.DEV_ADMIN_EMAIL ?? "dev@example.com";
    const devPassword = process.env.DEV_ADMIN_PASSWORD ?? "dev-password";
    const productionAuthConfigured = Boolean(expectedEmail && passwordHash);
    const devFallbackEnabled = !productionAuthConfigured;
    const valid =
      productionAuthConfigured && parsed.data.email === expectedEmail
        ? await safeComparePassword(parsed.data.password, passwordHash)
        : devFallbackEnabled && parsed.data.email === devEmail && parsed.data.password === devPassword;

    if (!valid) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const wantsJson = contentType.includes("application/json");
    const response = wantsJson
      ? NextResponse.json({ ok: true })
      : new NextResponse(null, { status: 303 });
    if (!wantsJson) {
      response.headers.set("Location", "/dashboard");
    }
    const cookieParts = [
      `${SESSION_COOKIE}=dev-session`,
      "HttpOnly",
      "SameSite=Lax",
      "Path=/",
      `Max-Age=${60 * 60 * 24 * 7}`
    ];
    if (process.env.NODE_ENV === "production") {
      cookieParts.push("Secure");
    }
    response.headers.append("Set-Cookie", cookieParts.join("; "));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}
