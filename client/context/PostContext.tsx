"use client";
import React, { useContext, useState, useCallback } from "react";
import { BASEURL } from "./ContextProvider";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { ApiError } from "@/hooks/useFetch";
import { useAuth } from "./AuthContext";
import { Post } from "@/components/PostCard";
import { Comment } from "@/components/CommentCard";

interface PostContext{
    posts: Post[] | null;
    isLoading: boolean;
    error: ApiError | null;
    fetchPosts: () => Promise<void>;
    createPost: (content: string, tags?: string[] | undefined, image_url?: string | undefined) => Promise<void>;
    likePost: (postId: string) => Promise<any>;
    addComment: (postId: string, content: string, parent_comment_id?: string | undefined) => Promise<void>;
    setError: React.Dispatch<React.SetStateAction<ApiError | null>>;
    likeComment: (commentID: string) => Promise<void>;
    fetchPostWithID: (postID: string) => Promise<any> | null;
    fetchCommentWithId: (commentID: string) => Promise<any> | null;
}

interface LikeType{
    message: string;
    likes_count: number;
    liked: boolean;
}

const PostContext = React.createContext<PostContext | undefined>(undefined);

export const PostProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData, setError:setErrorPost } = usePost();
    const { isLoading:isLoadingGet, error:errorGet, getData, setError:setErrorGet } = useGet();
    const { fetchWithAuth } = useAuth();

    const [posts, setPosts] = useState<Post[] | null>(null);   

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

    const fetchPostWithID = useCallback(async (postID:string) => {
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}posts/${postID}`, {
                credentials:"include",
            });
        });

        if(result){
            setPosts((prev) => {
                const postExists = prev?.find((p) => p.id === postID) || null;
                if(!postExists){
                    return [...(prev || []), result];
                }
                return prev;
            });
            return result;
        }
        else
            return null;

    }, [getData, fetchWithAuth]);

    const fetchCommentWithId = useCallback((commentID:string) => {
        const result = fetchWithAuth(async () => {
            return await getData(`${BASEURL}comments/${commentID}`, {
                credentials:"include",
            });
        });

        if(result)
            return result;
        else
            return null;
    }, [getData, fetchWithAuth])

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
            const postTemp = posts || [];
            // set as first element

            postTemp.unshift(result);
            setPosts(postTemp);
        }
    }, [postData, fetchWithAuth]);

    const likeComment = useCallback(async(commentID:string) => {
        const result = await fetchWithAuth(async() => {
            return await postData(`${BASEURL}comments/${commentID}/like`, {}, {
                credentials:"include",
            });
        });

        if(result){
            const likeResult:LikeType = result;

            setPosts((prevPosts) => {
                if(!prevPosts) return prevPosts;
                return prevPosts.map((post) => {
                    post.comments.forEach((comment) => {
                        if(comment.id === commentID){
                            comment.is_liked = likeResult.liked;
                            // Somehow it is increasing the likes count x2
                            // comment.likes = likeResult.liked ? [...comment.likes, comment.author_id] : comment.likes.filter((id) => id !== comment.author_id);
                            if(likeResult.liked){
                                if(!comment.likes.includes(comment.author_id))
                                    comment.likes.push(comment.author_id);
                            }
                            else
                                comment.likes = comment.likes.filter((id) => id !== comment.author_id);
                            comment.like_counter = likeResult.likes_count;
                            return comment;
                        }
                        else
                            return comment;
                    });

                    return post;
                })
            });
        }
    }, [postData])

    const likePost = useCallback(async (postId: string) => {
        const result = await fetchWithAuth(async() =>
            await postData(`${BASEURL}posts/${postId}/like`, {}, {
                credentials: "include",
            })
        );

        if (result) {
            const likeResult = result;

            setPosts((prevPosts) => {
                if (!prevPosts) return prevPosts;

                return prevPosts.map((post) => {
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
                });
            });
        }

        return result;
    }, [postData, fetchWithAuth]);

    const addComment = useCallback(async (content:string, postId?:string, parent_comment_id?:string) => {
       //  console.log(`content: ${content}, postId: ${postId}, parent_comment_id: ${parent_comment_id}`);
        const isChildComment = parent_comment_id?.trim() !== "";
        // TO DO: check if adding sub comment or main comment to post
        const URL =  isChildComment ? `${BASEURL}comments/${parent_comment_id}/comment` : `${BASEURL}posts/${postId}/comment`;

        const result: Comment = await fetchWithAuth(async () => {
            const result = await postData(URL, {
                content,
                parent_comment_id,
            }, {
                credentials:"include",
            });

            return result;
        });

        if(result){
            // console.log(JSON.stringify(result));
            setPosts((prevPosts) => {
                if(!prevPosts) return prevPosts;

                return prevPosts.map((post) => {
                    if (post.id !== postId) return post;
                    // If it's a child comment, find the parent comment to add the new comment
                    const updatedComments = [...post.comments, result];
                    if(isChildComment){
                        const parentComment = updatedComments.find(c => c.id === parent_comment_id);
                        if(parentComment){
                            const updatedChildComments = [...(parentComment.child_commets || []), result.id];
                            
                            return{
                                ...post,
                                comments: post.comments.map(comment => 
                                    comment.id === parent_comment_id ? {...comment,
                                        child_commets: updatedChildComments,
                                    } : comment
                                )
                            }
                        }
                    }
                    return {
                        ...post,
                        comments: updatedComments,
                    };
                })
            });
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
            setError: setErrorPost,
            likeComment,
            fetchPostWithID,
            fetchCommentWithId,
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