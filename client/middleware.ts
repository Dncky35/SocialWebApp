import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest){
    const token = request.cookies.get("refreshToken")?.value;
    // const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup";
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/feed") || request.nextUrl.pathname.startsWith("profile");

    if(!token && isProtectedRoute){
        return NextResponse.redirect(new URL("/", request.url));
    }

    if(token && isAuthRoute){
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher:["/login", "/signup", "/", "/feed/:path", "/profile/:path"],
};