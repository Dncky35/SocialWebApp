"use client";
import React, { useState, createContext, useContext, useCallback, useEffect } from "react";
import { PrivateAccount, PublicAccount } from "@/schemas/account";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import { ApiError } from "@/hooks/useFetch";
import { BASEURL } from "./ContextProvider";

interface AuthState{
    account: PrivateAccount | null;
    isLoading: boolean;
    setAccount: React.Dispatch<React.SetStateAction<null>>;
    signUp: (email: string, username: string, password: string) => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchWithAuth: (fetchFunc: () => Promise<any>) => Promise<any>;
    error: ApiError | null;
    fetchAccountWithId: (account_id: string) => Promise<PublicAccount | null>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData, setError:setErrorPost } = usePost("URLSearchParams");
    const { isLoading:isLoadingGet, error:errorGet, getData, setError:setErrorGet } = useGet();
    const [account, setAccount] = useState(null);

    useEffect(() => {
        // Getting account from local storage
        const account = localStorage.getItem("account");
        if(account){
            setAccount(JSON.parse(account));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signUp = useCallback(async (email:string, username:string, password:string) => {
        const result = await postData(`${BASEURL}auth/signup`, {email, username, password}, {
            credentials:"include",
        });

        if(result){
            setAccount(result);
            // store account on local store
            localStorage.setItem("account", JSON.stringify(result));

            // root to home page
            window.location.href = "/";
        }

    }, [postData]);

    const login = useCallback(async (username:string, password:string) => {
        const result = await postData(`${BASEURL}auth/login`, {username, password}, {
            credentials:"include",
        });

        if(result){
            localStorage.setItem("account", JSON.stringify(result));
            setAccount(result);
            window.location.href = "/";
        }    
    }, [postData]);

    const logout = useCallback(async () => {
        const result = await postData(`${BASEURL}auth/logout`, {}, {
            credentials:"include",
        });

        if(result){
            localStorage.removeItem("account");
            setAccount(null);
            window.location.href = "/";
        }

    }, [postData]);

    const isAccessTokenValid = async () => {
        let isValid = await getData(`${BASEURL}auth/verify_access_token`, {
            credentials:"include",
        });

        if(!isValid){
            isValid = await postData(`${BASEURL}auth/create_access_token`, {},{
                credentials:"include",
            });

            if(isValid)
                return true;
            else{
                await logout();
                return false;
            }
        }
        else
            return true;
    };

    const fetchWithAuth = async ( fetchFunc: () => Promise<any>) => {
        const isTokenValid = await isAccessTokenValid();
        if(!isTokenValid)
            return null;
        else
            return await fetchFunc();
    };

    const fetchAccountWithId = useCallback(async (account_id:string) => {
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}/accounts/profile/${account_id}`, {
                credentials:"include",
            });
        });

        if(result){
            return result as PublicAccount;
        }
        else
            return null;
    }, [getData, fetchWithAuth]);

    return (
        <AuthContext.Provider value={
            {account, error: errorPost || errorGet, isLoading: isLoadingPost || isLoadingGet, 
                setAccount, signUp, login, logout, fetchWithAuth, fetchAccountWithId
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}