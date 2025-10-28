"use client";

import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const BASEURL = "https://8000-cs-557130547078-default.cs-europe-west1-haha.cloudshell.dev/";
// export const BASEURL = "/api/";
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
 
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <GoogleOAuthProvider clientId={clientId} >
            <AuthProvider>
                <PostProvider>
                    {children}
                </PostProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
};