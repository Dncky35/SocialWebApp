import useFetch, { ApiError } from "./useFetch";

type BodyFormat = "JSON" | "URLSearchParams";

interface usePutOptions{
    headers?: Record<string, string>;
    bodyFormat?: BodyFormat;
};

interface usePutReturn<T>{
    isLoading: boolean;
    error: ApiError | null;
    patchData: (url:string, body: {}) => Promise<any>;
};

const usePatch = <T=any>(options?:usePutOptions): usePutReturn<T> => {
    const { fetchData, isLoading, error } = useFetch();
    const patchData = async (url:string, body: {}) => {
        const serializeBody = options?.bodyFormat === "URLSearchParams" ? new URLSearchParams(body).toString() : JSON.stringify(body);

        return fetchData(url, {
            method: "PATCH",
            headers:{
                "Content-Type":options?.bodyFormat === "URLSearchParams" ? "application/x-www-form-urlencoded" : "application/json",
                ...(options?.headers || {}),
            },
            body:serializeBody,
            ...options
        });
    };

    return { isLoading, error, patchData };
};

export default usePatch;