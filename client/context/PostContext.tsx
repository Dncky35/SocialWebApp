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
    createPost: (content: string, tags?: string[] | undefined, image_url?: string | undefined) => Promise<void>;
    likePost: (postId: string) => Promise<any>;
    addComment: (postId: string, content: string, parent_comment_id?: string | undefined) => Promise<void>;
}

interface LikeType{
    message: string;
    likes_count: number;
    liked: boolean;
}

const PostContext = React.createContext<PostContext | undefined>(undefined);

export const PostProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData } = usePost();
    const { isLoading:isLoadingGet, error:errorGet, getData } = useGet();
    const { fetchWithAuth } = useAuth();

    const [posts, setPosts] = useState<Post[]>([]);   

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

    const createPost = useCallback(async (content: string, tags?: string[], image_url?: string,) => {
        const result:Post = await fetchWithAuth(async ()=> {
            return await postData(`${BASEURL}posts`, {
                content,
                image_url,
                tags,
            }, {
                credentials:"include",
            });
        });

        if(result){
            const postTemp = posts;
            // set as first element
            postTemp.unshift(result);
            setPosts(postTemp);
        }
    }, [postData, fetchWithAuth]);

    const likePost = useCallback(async (postId: string) => {
        const result = await fetchWithAuth(() =>
            postData(`${BASEURL}posts/${postId}/like`, {}, {
                credentials: "include",
            })
        );

        if (result) {
            const likeResult: LikeType = result;

            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id !== postId) return post;

                    // Toggle user ID in likes list
                    const updatedLikes = likeResult.liked
                        ? [...post.likes, post.owner.id]
                        : post.likes.filter((id) => id !== post.owner.id);

                    return {
                        ...post,
                        is_liked: likeResult.liked,
                        likes: updatedLikes,
                    };
                })
            );
        }

        return result;
    }, [postData, fetchWithAuth]);

    const addComment = useCallback(async (postId:string, content:string, parent_comment_id?:string) => {
        const result = await fetchWithAuth(async () => {
            return await postData(`${BASEURL}posts/${postId}/comment`, {
                content,
                parent_comment_id,
            }, {
                credentials:"include",
            });
        });

        if(result){
            // console.log(JSON.stringify(result));
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id !== postId) return post;

                    const updatedComments = [...post.comments, result];

                    return {
                        ...post,
                        comments: updatedComments,
                    };
                })
            );
        }

    }, [postData, fetchWithAuth]);

    return(
        <PostContext.Provider value={{
            posts, 
            isLoading: isLoadingPost || isLoadingGet, 
            error: errorPost || errorGet,
            fetchPosts,
            createPost,
            likePost,
            addComment,
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