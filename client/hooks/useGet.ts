"use client";
import useFetch, { ApiError } from "./useFetch";

interface UseGetReturn{
    error: ApiError | null;
    isLoading: boolean;
    getData: (url: string, options: RequestInit) => Promise<any>;
    setError: React.Dispatch<React.SetStateAction<ApiError | null>>
}

const useGet = (): UseGetReturn => {
    const { isLoading, error, fetchData, setError } = useFetch();
    
    const getData = async (url:string, options?: RequestInit ) =>{
        return await fetchData(url, {
            method: "GET",
            ...options,
        });
    };

    return { error, isLoading, getData, setError } 

};

export default useGet;