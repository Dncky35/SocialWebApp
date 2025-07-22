"use client";
import React, { useState, createContext, useContext } from "react";
import { PrivateAccount } from "@/schemas/account";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";

interface AuthState{
    account: PrivateAccount | null;
    isLoading: boolean;
    setAccount: React.Dispatch<React.SetStateAction<null>>
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData } = usePost("URLSearchParams");
    const { isLoading:isLoadingGet, error:errorGet, getData } = useGet();

    const [account, setAccount] = useState(null);

    return (
        <AuthContext.Provider value={{account, isLoading: isLoadingPost || isLoadingGet, setAccount}}>
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