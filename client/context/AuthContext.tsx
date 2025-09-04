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
    pageState: PageState;
    setPageState: React.Dispatch<React.SetStateAction<PageState>>;
    setNullEachError: () => void;
}

export type PageState = "Completed" | "Initializing";

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData, setError:setErrorPost } = usePost("URLSearchParams");
    const { isLoading:isLoadingGet, error:errorGet, getData, setError:setErrorAuth} = useGet();
    const [account, setAccount] = useState(null);
    const [pageState, setPageState] = useState<PageState>("Initializing");

    useEffect(() => {
        // Getting account from local storage
        const account = localStorage.getItem("account");
        if(account){
            setAccount(JSON.parse(account));
            setPageState("Completed")
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setNullEachError = () => {
        setErrorPost(null);
        setErrorAuth(null);
    }

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
            localStorage.removeItem("lastFetchDate");
            localStorage.removeItem("posts");
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

    return (
        <AuthContext.Provider value={
            {
                account, 
                error: errorPost || errorGet, 
                isLoading: isLoadingPost || isLoadingGet,
                pageState,
                setPageState,
                setAccount, 
                signUp, 
                login, 
                logout, 
                fetchWithAuth,
                setNullEachError,
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