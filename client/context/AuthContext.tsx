"use client";
import React, { useState, createContext, useContext } from "react";

interface AuthState{
    account: null;
    setAccount: React.Dispatch<React.SetStateAction<null>>
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const [account, setAccount] = useState(null);

    return (
        <AuthContext.Provider value={{account, setAccount}}>
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