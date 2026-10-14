import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname, searchParams } = request.nextUrl;

  // Allow direct access to workspace if joining an invited room with ?room=
  const isRoomInvite = pathname.startsWith("/workspace") && searchParams.has("room");

  // Define protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/workspace") && !isRoomInvite) ||
    pathname.startsWith("/onboarding");

  // Define auth routes (only for guests)
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    const redirectTarget = request.nextUrl.pathname + request.nextUrl.search;
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const redirectParam = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    const targetUrl = new URL(redirectParam, request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/login",
    "/signup",
  ],
};
