import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest){
    const token = request.cookies.get("refreshToken")?.value;
    // const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup";

    // if(!token){
    //     return NextResponse.redirect(new URL("/", request.url));
    // }

    if(token && isAuthRoute){
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher:["/login", "/signup", "/",]
};