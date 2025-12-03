// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sessionToken")?.value;
  // console.log("Token:", token || "No token found");

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/feed") || pathname.startsWith("/profile");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed/:path*", "/profile/:path*", "/auth/:path*"],
};
