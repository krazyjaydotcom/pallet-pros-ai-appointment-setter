import { NextResponse } from "next/server";
import { z } from "zod";
import { safeComparePassword, SESSION_COOKIE } from "@/src/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const devEmail = process.env.DEV_ADMIN_EMAIL ?? "dev@example.com";
  const devPassword = process.env.DEV_ADMIN_PASSWORD ?? "dev-password";
  const isDevelopment = process.env.NODE_ENV !== "production";
  const devFallbackEnabled = isDevelopment && !passwordHash;
  const valid =
    parsed.data.email === expectedEmail && passwordHash
      ? await safeComparePassword(parsed.data.password, passwordHash)
      : devFallbackEnabled && parsed.data.email === devEmail && parsed.data.password === devPassword;

  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "dev-session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
