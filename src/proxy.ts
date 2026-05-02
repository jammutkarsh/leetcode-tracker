import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const isPrivateMode = process.env.PRIVATE_MODE === "true";

  const isLoginPath = request.nextUrl.pathname === "/login";

  const isLoginApi = request.nextUrl.pathname.startsWith("/api/login") || 
                    request.nextUrl.pathname.startsWith("/api/verify-instance");

  // If not private mode, or not a protected path, allow
  if (!isPrivateMode) {
    if (isLoginPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Allow login paths in private mode
  if (isLoginPath || isLoginApi) {
    return NextResponse.next();
  }

  // Boilerplate logic: Check JWT only on specific protected routes.
  // Add paths you want to protect here, or use the matcher below.
  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Pass user info to the route if needed
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-username", payload.username as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/login", "/api/:path*"],
};
