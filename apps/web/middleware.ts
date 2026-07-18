import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api/health", "/api/auth/login", "/api/auth/logout", "/api/auth/me", "/api/kommo/webhook", "/api/kommo/oauth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has("ppaa_admin_session");
  if (!hasSession) {
    const response = new NextResponse(null, { status: 307 });
    response.headers.set("Location", "/login");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
