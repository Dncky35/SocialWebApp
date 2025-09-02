import { useState } from "react";

export interface ApiError{
    status: number;
    detail: string;
}

const useFetch = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchData = async (url:string, options?: RequestInit):Promise<any | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorResponse = await response.json().catch(() => null);
                
                setError({
                    status: response.status, 
                    detail: errorResponse?.detail || "Unknown Error Occured",
                });
                return null;
            }
            const data = await response.json();
            return data
        }
        catch (error) {
            setError({ status: 500, detail: "Cannot reach server!" });
            return null;
        }        
        finally{
            setLoading(false);
        }
    };
    
    return { isLoading, error, fetchData }
};

export default useFetch;