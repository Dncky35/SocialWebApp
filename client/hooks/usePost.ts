import useFetch, { ApiError } from "./useFetch";

type BodyFormat = "JSON" | "URLSearchParams"

interface UsePostOptions{
    bodyFormat?: BodyFormat;
    headers?: Record<string, string>;
}

interface UsePostReturn{
    error: ApiError | null;
    isLoading: boolean;
    postData: (url: string, body: {}, options: RequestInit) => Promise<any>
};

const usePost = (options?: UsePostOptions): UsePostReturn => {
    const { isLoading, error, fetchData } = useFetch();
    const postData = async (url: string, body: {}) => {
        const serializeBody = options?.bodyFormat === "URLSearchParams" ? new URLSearchParams(body).toString() : JSON.stringify(body);

        return fetchData(url, {
                method:"POST",
                    headers:{
                        "Content-Type":options?.bodyFormat === "URLSearchParams" ? "application/x-www-form-urlencoded" : "application/json",
                        ...(options?.headers || {}),
                    },
                    body:serializeBody,
                    ...options
            });
        };
    return { isLoading, error, postData };
}

export default usePost;

