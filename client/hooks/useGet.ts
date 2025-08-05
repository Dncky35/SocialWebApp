"use client";
import { Dispatch, SetStateAction } from 'react';
import useFetch, { ApiError } from "./useFetch";

interface UseGetReturn{
    error: ApiError | null;
    isLoading: boolean;
    getData: (url: string, options: RequestInit) => Promise<any>;
    setError: Dispatch<SetStateAction<ApiError | null>>;
}

const useGet = (): UseGetReturn => {
    const { isLoading, error, fetchData, setError } = useFetch();
    
    const getData = async (url:string, options?: RequestInit ) =>{
        return fetchData(url, {
            method: "GET",
            ...options,
        });
    };

    return { error, isLoading, getData, setError } 

};

export default useGet;