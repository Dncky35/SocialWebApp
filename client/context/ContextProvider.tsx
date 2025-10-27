"use client";
import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";

// export const BASEURL = "https://8000-cs-557130547078-default.cs-europe-west1-haha.cloudshell.dev/";
export const BASEURL = "/api/" ;

export const AppProviders = ({children}: {children: React.ReactNode}) => {
    return (
        <AuthProvider>
            <PostProvider>
                {children}
            </PostProvider>
        </AuthProvider>
    );
};