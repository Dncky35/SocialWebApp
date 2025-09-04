"use client";
import React, { useState } from 'react';
import { ApiError } from '@/hooks/useFetch';
import { AlertCircle, X } from 'lucide-react';
import { usePostContext } from '@/context/PostContext';
import { useAuth } from '@/context/AuthContext';

interface Props {
    error?: ApiError;
}

const ErrorDisplay:React.FC<Props> = ({ error }) => {
    const { setNullEachError: setNullEachErrorPost } = usePostContext();
    const { setNullEachError: setNullEachErrorAuth } = useAuth();
    const [isClosed, setIsClosed] = useState<boolean>(false);

    const handleOnClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setNullEachErrorPost();
        setNullEachErrorAuth();
        setIsClosed(true);
    };

    if(!isClosed){
        return (
            <div className="flex items-center justify-between rounded-lg bg-red-100 p-2 text-md text-red-600">
                <div className='flex items-center gap-4'>
                    <AlertCircle className="h-4 w-4" />
                    <p className='font-semibold'>{error?.detail || "Unknown error occured!"}</p>
                </div>
                <button 
                onClick={(e) => handleOnClose(e)}
                className='rounded-full bg-red-300 p-1 cursor-pointer hover:scale-[1.1] hover:bg-red-400 transform transition duration-300'>
                    <X />
                </button>
            </div>
        );
    }

    else
        return null;

};

export default ErrorDisplay;
