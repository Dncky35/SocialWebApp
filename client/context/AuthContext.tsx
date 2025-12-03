"use client";
import React, { useState, createContext, useContext, useCallback, useEffect } from "react";
import { PrivateAccount } from "@/schemas/account";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import usePatch from "@/hooks/usePatch";
import { ApiError } from "@/hooks/useFetch";
import { BASEURL } from "./ContextProvider";

interface AuthState {
    account: PrivateAccount | null;
    isLoading: boolean;
    setAccount: React.Dispatch<React.SetStateAction<PrivateAccount | null>>
    signUp: (email: string, username: string, password: string) => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchWithAuth: (fetchFunc: () => Promise<any>) => Promise<any>;
    updateProfile: (full_name?: string, bio?: string, avatar_url?: string) => Promise<boolean>;
    error: ApiError | null;
    pageState: PageState;
    setPageState: React.Dispatch<React.SetStateAction<PageState>>;
    setNullEachError: () => void;
    authWithGoogle: (token: string) => Promise<boolean>;
}

export type PageState = "Completed" | "Initializing";

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoading: isLoadingPost, error: errorPost, postData, setError: setErrorPost } = usePost("URLSearchParams");
    const { isLoading: isLoadingGet, error: errorGet, getData, setError: setErrorAuth } = useGet();
    const { isLoading: isLoadingPatch, error: errorPatch, patchData, setError: setErrorPatch } = usePatch({
        bodyFormat: "JSON", headers: {
            "Content-Type": "application/json",
            credentials: "include",
        }
    });
    const [account, setAccount] = useState<PrivateAccount | null>(null);
    const [pageState, setPageState] = useState<PageState>("Initializing");

    useEffect(() => {
        // Getting account from local storage
        const account = localStorage.getItem("account");
        if (account) {
            setAccount(JSON.parse(account));
            setPageState("Completed")
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setNullEachError = () => {
        setErrorPost(null);
        setErrorAuth(null);
        setErrorPatch(null);
    }

    const authWithGoogle = useCallback(async (credentialResponse: any): Promise<boolean> => {
        if (!credentialResponse.credential) return false;

        try {
            const res = await fetch(`${BASEURL}auth/account/sign_in_with_google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
                credentials: "include",
            });

            const data = await res.json();
            setAccount(data);
            localStorage.setItem("account", JSON.stringify(data));
            window.location.href = "/";
            return true;
            // setUser(data); // update context
        } catch (err) {
            console.error("Google login failed:", JSON.stringify(err));
            return false;
        }

    }, []);


    const signUp = useCallback(async (email: string, username: string, password: string) => {
        const result = await postData(`${BASEURL}auth/account/signup`, { email, username, password }, {
            credentials: "include",
        });

        if (result) {
            setAccount(result);
            // store account on local store
            localStorage.setItem("account", JSON.stringify(result));

            // root to home page
            window.location.href = "/";
        }

    }, [postData]);

    const login = useCallback(async (username: string, password: string) => {
        const result = await postData(`${BASEURL}auth/account/login`, { username, password }, {
            credentials: "include",
        });

        if (result) {
            localStorage.setItem("account", JSON.stringify(result));
            setAccount(result);
            window.location.href = "/";
        }
    }, [postData]);

    const logout = useCallback(async () => {
        const result = await postData(`${BASEURL}auth/account/logout`, {}, {
            credentials: "include",
        });

        if (result) {
            localStorage.removeItem("account");
            localStorage.removeItem("lastFetchDate");
            localStorage.removeItem("posts");
            setAccount(null);
            window.location.href = "/";
        }

    }, [postData]);

    const isAccessTokenValid = async () => {
        let isValid = await getData(`${BASEURL}auth/verify_access_token`, {
            credentials: "include",
        });

        if (!isValid) {
            isValid = await postData(`${BASEURL}auth/create_access_token`, {}, {
                credentials: "include",
            });

            if (isValid)
                return true;
            else {
                await logout();
                return false;
            }
        }
        else
            return true;
    };

    const fetchWithAuth = async (fetchFunc: () => Promise<any>) => {
        const isTokenValid = await isAccessTokenValid();
        if (!isTokenValid)
            return null;
        else
            return await fetchFunc();
    };

    const updateProfile = useCallback(async (fullName?: string, bio?: string, avatarUrl?: string) => {
        const result = await fetchWithAuth(async () => {
            return await patchData(`${BASEURL}accounts/profile/me`, {
                fullName,
                bio,
                avatarUrl,
            });
        });

        if (result) {
            console.log(`result: ${JSON.stringify(result)} `);
            // TO DO: update current account without fetch data again
            setAccount(prevAccount => {
                if (!prevAccount) return null;
                const updatedAccount = {
                    ...prevAccount,
                    full_name: fullName ?? prevAccount.full_name,
                    bio: bio ?? prevAccount.bio,
                    avatar_url: avatarUrl ?? prevAccount.avatar_url,
                };
                localStorage.setItem("account", JSON.stringify(updatedAccount));
                return updatedAccount;
            });

            return true;
        }
        return false;
    }, [patchData, fetchWithAuth]);

    return (
        <AuthContext.Provider value={
            {
                account,
                error: errorPost || errorGet || errorPatch,
                isLoading: isLoadingPost || isLoadingGet || isLoadingPatch,
                pageState,
                setPageState,
                setAccount,
                signUp,
                login,
                logout,
                fetchWithAuth,
                setNullEachError,
                updateProfile,
                authWithGoogle,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}