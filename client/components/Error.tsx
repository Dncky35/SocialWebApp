"use client";
import { ApiError } from '@/hooks/useFetch';
import React, { useState } from 'react';

interface ErrorInterface {
    status: number;
    detail: string;
}

const ErrorComponent:React.FC<ErrorInterface> = ({ status, detail }) => {
    const [isClosed, setIsClosed] = useState<boolean>(false);

    if(isClosed){
        return null;
    }

    const handleOnClicked = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setIsClosed(true);
    };

    return (  
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="flex flex-col gap-y-4 rounded-lg shadow-lg p-6 max-w-xl text-center text-lg 
            font-semibold text-emerald-900 flex items-center space-x-4 bg-emerald-700">
                <div className=" shadow-xl rounded py-2 px-6 text-white">
                    <p>Status Code: {status}</p>
                    <p>Detail: {detail}</p>
                </div>
                <button
                    onClick={(e) => handleOnClicked(e)}
                    className="bg-emerald-500 py-2 px-4 rounded cursor-pointer hover:bg-emerald-600">
                    Close
                </button>
            </div>
        </div>
    );
};

export default ErrorComponent;