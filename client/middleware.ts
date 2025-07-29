// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // console.log("✅ Middleware triggered on:", request.nextUrl.pathname);
  // console.log("🍪 Cookies in request:", request.cookies.getAll());
  const token = request.cookies.get("refreshToken")?.value;
  // console.log("Token:", token || "No token found");

  const pathname = request.nextUrl.pathname;
  // console.log("Pathname:", pathname);
  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/feed") || pathname.startsWith("/profile");

  // Redirect unauthenticated users from protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users from auth routes
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if(token && pathname === "/"){
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/", "/feed/:path*", "/profile/:path*"],
};
