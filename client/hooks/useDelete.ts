"use client";
import { Dispatch, SetStateAction, use } from 'react';
import useFetch, { ApiError } from "./useFetch";

interface useDeleteReturn{
    error: ApiError | null;
    isLoading: boolean;
    deleteData: (url: string, options: RequestInit) => Promise<any>;
}

const useDelete = ():useDeleteReturn => {
    const { isLoading, error, fetchData } = useFetch();

    const deleteData = async (url:string, options?: RequestInit)=> {
        const result = await fetchData(url, {
            method:"DELETE",
            ...options,
        });

        return result;
    };

    return { isLoading, error, deleteData };

}

export default useDelete;