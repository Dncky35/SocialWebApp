"use client";
import React, { useContext, useState, useCallback } from "react";
import { BASEURL } from "./ContextProvider";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { ApiError } from "@/hooks/useFetch";
import { useAuth } from "./AuthContext";
import { Post } from "@/components/PostCard";
import { Comment } from "@/components/CommentCard";

export const FeedOptions = ["Latest", "Following", "Trending"];

export const tagList:string[] = ["Sport", "News", "Science", "Technology", "Politics", "Entertainment", "Health", "Travel", "Food", "Lifestyle"];

interface PostContext{
    posts: Post[] | null;
    isLoading: boolean;
    error: ApiError | null;
    createPost: (content: string, tags?: string[] | undefined, image_url?: string | undefined) => Promise<void>;
    likePost: (postId: string) => Promise<any>;
    addComment: (postId: string, content: string, parent_comment_id?: string | undefined) => Promise<void>;
    setError: React.Dispatch<React.SetStateAction<ApiError | null>>;
    likeComment: (commentID: string) => Promise<void>;
    searchPosts: (options: PostSearchOptions) => Promise<void>;
    fetchCommentWithId: (commentID: string) => Promise<any> | null;
    followAccount: (accountID: string) => Promise<boolean>;
    fetchAccountWithId: (account_id: string) => Promise<void>;
    getFeedPageData: () => Promise<void>;
}

interface LikeType{
    message: string;
    likes_count: number;
    liked: boolean;
}

interface FetchPostOptions{
    tag?:string;
    feed?:string;
};

interface PostSearchOptions {
    id?:string;
}

const PostContext = React.createContext<PostContext | undefined>(undefined);

export const PostProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const { isLoading:isLoadingPost, error:errorPost, postData, setError:setErrorPost } = usePost();
    const { isLoading:isLoadingGet, error:errorGet, getData, setError:setErrorGet } = useGet();
    const { fetchWithAuth } = useAuth();
    const [posts, setPosts] = useState<Post[] | null>(null);   

    const getLocalStoragedPosts = () => {
        const result = localStorage.getItem("posts");
        if(result){
            setPosts(JSON.parse(result));
            return JSON.parse(result) as Post[];
        }
        else
            return null;
    };

    const storeFetchedPosts = (posts:Post[]) => {
        const storedPosts = getLocalStoragedPosts();
        let newPosts:Post[] = [];

        if(!storedPosts){
            setPosts(posts);
            localStorage.setItem("posts", JSON.stringify(posts));
        }
        else{
            newPosts = posts;
            posts.map((post) => {
                const postExists = storedPosts?.find((p) => p.id === post.id) || null;
                if(!postExists){
                    newPosts.push(post);
                }
            });
            setPosts(newPosts);
            localStorage.setItem("posts", JSON.stringify(newPosts));  
        }
    };

    const fetchPosts = useCallback(async (options?:FetchPostOptions) => {
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}posts`, {
                credentials:"include",
            });
        });

        if(result){
            localStorage.setItem("lastFetchDate", new Date().toISOString());
            storeFetchedPosts(result);
            return result;
        }
        else{
            return null;
        }
        
    }, [getData, fetchWithAuth]);

    const getFeedPageData = useCallback(async () => {
        const lastFetchDate = localStorage.getItem("lastFetchDate");
        // IF 10 minutes passed, fetch again
        if(!lastFetchDate || new Date().getTime() - new Date(lastFetchDate).getTime() > 10 * 60 * 1000){
            await fetchPosts();
            return;
        }
        
        const storedPosts = getLocalStoragedPosts();
        if(!storedPosts){
            await fetchPosts();
        }

    }, [fetchPosts]);

    const fetchPostWithID = useCallback(async (postID:string) => {
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}posts/${postID}`, {
                credentials:"include",
            });
        });

        if(result){
            storeFetchedPosts([result]);
            return result;
        }
        else
            return null;

    }, [getData, fetchWithAuth]);

    const searchPosts = async (options:PostSearchOptions) => {
        // Check if post stored locally.
        const storedPosts = getLocalStoragedPosts(); 
        if(!storedPosts){
            if(options.id){
                await fetchPostWithID(options.id);
            }
        }
        else{
        }
    };
    
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

    const followAccount = useCallback(async (accountID: string) => {
        const result = await fetchWithAuth(async() => {
            return await postData(`${BASEURL}accounts/follow/${accountID}`, {}, {
                credentials: "include",
            });
        });

        if(result){
            // Update the posts state to reflect the new follow status
            setPosts((prevPosts) => {
                if (!prevPosts) return prevPosts;

                return prevPosts.map((post) => {
                    if (post.owner.id !== accountID) return post;

                    return {
                        ...post,
                        owner: {
                            ...post.owner,
                            is_following: !post.owner.is_following,
                            followers_count: post.owner.is_following ? post.owner.followers_count - 1 : post.owner.followers_count + 1
                        },
                    };
                });
            });
            return true;
        }
        else{
            return false;
        }

    }, [postData, fetchWithAuth])

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

    // profile/{account_id}/posts
    // fethcing posts instead of account, the account will get from posts
    const fetchAccountWithId = useCallback(async (account_id:string) => {
        const result:Post[] = await fetchWithAuth(async () => {
            // return await getData(`${BASEURL}/accounts/profile/${account_id}`, {
            //     credentials:"include",
            // });
            return await getData(`${BASEURL}/accounts/profile/${account_id}/posts`, {
                credentials:"include",
            });
        });

        if(result){
            storeFetchedPosts(result);
            // result.map((post) => {
            //     setPosts((prev) => {
            //         // Avoid duplicates
            //         const postExists = prev?.find((p) => p.id === post.id) || null;
            //         if(postExists) return prev;
            //             return ([...(prev || []), post])
            //     });
            // });
        }

    }, [getData, fetchWithAuth]);

    return(
        <PostContext.Provider value={{
            posts, 
            isLoading: isLoadingPost || isLoadingGet, 
            error: errorPost || errorGet,
            // fetchPosts,
            createPost,
            likePost,
            addComment,
            setError: setErrorPost,
            likeComment,
            searchPosts,
            fetchCommentWithId,
            followAccount,
            fetchAccountWithId,
            getFeedPageData,
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