"use client";
import { Dispatch, SetStateAction } from 'react';
import useFetch, { ApiError } from "./useFetch";

type BodyFormat = "JSON" | "URLSearchParams";

interface UsePostReturn{
    error: ApiError | null;
    isLoading: boolean;
    postData: (url: string, body: {}, options: RequestInit) => Promise<any>;
    setError: Dispatch<SetStateAction<ApiError | null>>;
};

const usePost = (bodyFormat: BodyFormat = "JSON"): UsePostReturn => {
    const { isLoading, error, fetchData, setError } = useFetch();
    const postData = async (url: string, body: {}, options?: RequestInit) => {
        const serializeBody = bodyFormat === "URLSearchParams" ? new URLSearchParams(body).toString() : JSON.stringify(body);

        return fetchData(url, {
            method:"POST",
            headers:{
                "Content-Type": bodyFormat === "URLSearchParams" ? "application/x-www-form-urlencoded" : "application/json",
                ...options?.headers,
            },
            body:serializeBody,
            ...options
        });    
    };
    return { isLoading, error, postData, setError };
}

export default usePost;

