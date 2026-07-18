import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ppaa_admin_session";

export function safeComparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
