"use client";
import React, {useContext, useState, useCallback, use} from "react";
// import { useRouter } from "next/navigation";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { ApiError } from "@/hooks/useFetch";
import { useAuth } from "./AuthContext";

interface PostContext{
    posts: any[];
    isLoading: boolean;
    error: ApiError | null;
    fetchPosts: () => Promise<void>;
}

const PostContext = React.createContext<PostContext | undefined>(undefined);

export const PostProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData } = usePost();
    const { isLoading:isLoadingGet, error:errorGet, getData } = useGet();
    const { fetchWithAuth } = useAuth();

    const [posts, setPosts] = useState([]);   

    const fetchPosts = useCallback(async () => {
            const result = await fetchWithAuth(async () => {
                await getData("/api/posts", {
                credentials:"include",
                headers:{
                    "Content-Type":"application/json",
                },
            });
        });

        console.log(result);
    }, [getData, fetchWithAuth]);

    return(
        <PostContext.Provider value={{
            posts, 
            isLoading: isLoadingPost || isLoadingGet, 
            error: errorPost || errorGet,
            fetchPosts
            }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePostContext = () => {
    const context = useContext(PostContext);
    if(!context){
        throw new Error("usePostContext must be used within a PostProvider");
    }

    return context;
};