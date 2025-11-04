"use client";
import React from 'react';
import { BASEURL } from "@/context/ContextProvider";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
// import { useAuth } from "@/context/AuthContext";

const GoogleLoginButton: React.FC = () => {

    // const { authWithGoogle, isLoading, error } = useAuth();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return false;

        try {
            const res = await fetch(`${BASEURL}auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
                credentials: "include",
            });

            const data = await res.json();
            localStorage.setItem("account", JSON.stringify(data));
            window.location.href = "/";
            return true;
            // setUser(data); // update context
        } catch (err) {
            console.error("Google login failed:", JSON.stringify(err));
            return false;
        }
    };

    return (
        <div>
            <GoogleLogin onSuccess={handleSuccess} onError={() => console.error("Google Sign-In failed")} />
        </div>
    )
};

export default GoogleLoginButton;