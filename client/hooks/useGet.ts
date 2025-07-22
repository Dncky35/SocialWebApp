import useFetch, { ApiError } from "./useFetch";

interface UseGetReturn{
    error: ApiError | null;
    isLoading: boolean;
    getData: (url: string, options: RequestInit) => Promise<any>
}

const useGet = (): UseGetReturn => {
    const { isLoading, error, fetchData } = useFetch();
    
    const getData = async (url:string, options?: RequestInit ) =>{
        return fetchData(url, {
            method: "GET",
            ...options,
        });
    };

    return { error, isLoading, getData} 

};

export default useGet;