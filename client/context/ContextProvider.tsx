"use client";
import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";

export const BASEURL = process.env.BACKEND_URL ? "/api/" : "https://8000-dncky35-socialwebapp-09hw3b6xdaz.ws-us120.gitpod.io/"
// export const BASEURL = "/api/" 

export const AppProviders = ({children}: {children: React.ReactNode}) => {
    return (
        <AuthProvider>
            <PostProvider>
                {children}
            </PostProvider>
        </AuthProvider>
    );

};