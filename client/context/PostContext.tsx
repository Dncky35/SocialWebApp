"use client";
import React, { useContext, useState, useCallback } from "react";
import { BASEURL } from "./ContextProvider";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { ApiError } from "@/hooks/useFetch";
import { useAuth } from "./AuthContext";
import { Post } from "@/components/Post";

interface PostContext{
    posts: Post[];
    isLoading: boolean;
    error: ApiError | null;
    fetchPosts: () => Promise<void>;
    createPost: (content: string, image_url?: string | undefined) => Promise<void>;
}

const PostContext = React.createContext<PostContext | undefined>(undefined);

export const PostProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData } = usePost();
    const { isLoading:isLoadingGet, error:errorGet, getData } = useGet();
    const { fetchWithAuth } = useAuth();

    const [posts, setPosts] = useState([]);   

    const fetchPosts = useCallback(async () => {
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}posts`, {
                credentials:"include",
            });
        });

        if(result){
            setPosts(result);
        
        }
    }, [getData, fetchWithAuth]);

    const createPost = useCallback(async (content: string, image_url?: string,) => {
        const result:Post = await fetchWithAuth(async ()=> {
            return await postData(`${BASEURL}posts/`, {
                content,
                image_url,
            }, {
                credentials:"include",
                headers:{
                    "Content-Type":"application/json",
                },
            });
        });

        if(result){
            const postTemp = posts;
            postTemp.push(result as never);
            // set as first element
            postTemp.unshift(result as never);
            setPosts(postTemp);
        }
    }, [postData, fetchWithAuth]);

    return(
        <PostContext.Provider value={{
            posts, 
            isLoading: isLoadingPost || isLoadingGet, 
            error: errorPost || errorGet,
            fetchPosts,
            createPost,
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