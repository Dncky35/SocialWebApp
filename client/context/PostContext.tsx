"use client";
import React, { useContext, useState, useCallback, useEffect } from "react";
import { BASEURL } from "./ContextProvider";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import usePatch from "@/hooks/usePatch";
import useDelete from "@/hooks/useDelete";
import { ApiError } from "@/hooks/useFetch";
import { useAuth } from "./AuthContext";
import { Post } from "@/components/Posts/PostCard";
import { Comment } from "@/components/Posts/CommentCard";

export const FeedOptions = ["Latest", "Following", "Trending"];

export const tagList: string[] = ["", "Sport", "News", "Science", "Technology", "Politics", "Entertainment", "Health", "Travel", "Food", "Lifestyle"];

interface PostContext {
    posts: Post[] | null;
    isLoading: boolean;
    error: ApiError | null;
    createPost: (content: string, tags?: string[] | undefined, image_url?: string | undefined) => Promise<void>;
    likePost: (postId: string) => Promise<any>;
    addComment: (postId: string, content: string, parent_comment_id?: string | undefined) => Promise<void>;
    likeComment: (commentID: string) => Promise<void>;
    searchPosts: (options: PostSearchOptions) => Promise<void>;
    // editPost: (postID: string, postData: {
    //     content: string;
    //     image_url?: string;
    // }) => Promise<boolean>
    fetchCommentWithId: (commentID: string) => Promise<any> | null;
    followAccount: (accountID: string) => Promise<boolean>;
    fetchAccountWithId: (account_id: string) => Promise<void>;
    getFeedPageData: (page: number) => Promise<void>;
    feedValue: string;
    tagValue: string;
    hasMore: boolean;
    setFeedValue: React.Dispatch<React.SetStateAction<string>>;
    setTagValue: React.Dispatch<React.SetStateAction<string>>;
    setNullEachError: () => void;
    deletePost: (postId: string) => Promise<boolean>;
}

interface LikeType {
    message: string;
    likes_count: number;
    liked: boolean;
}

interface PostSearchOptions {
    id?: string;
}

const PostContext = React.createContext<PostContext | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoading: isLoadingPost, error: errorPost, postData, setError: setErrorPost } = usePost();
    const { isLoading: isLoadingGet, error: errorGet, getData, setError: setErrorAuth } = useGet();
    const { isLoading: isLoadingPatch, error: errorPatch, patchData, setError: setErrorPatch } = usePatch({
        bodyFormat: "JSON", headers: {
            "Content-Type": "application/json",
            credentials: "include",
        }
    });
    const { isLoading: isLoadingDelete, error:errorDelete, deleteData, setError: setErrorDelete} = useDelete();
 
    const { account, fetchWithAuth, setNullEachError: setNullEachErrorAuth } = useAuth();
    const [posts, setPosts] = useState<Post[] | null>(null);
    const [feedValue, setFeedValue] = useState<string>(FeedOptions[0]);
    const [tagValue, setTagValue] = useState<string>(tagList[0]);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        if (!account)
            return;

        if (!isLoadingGet && !isLoadingPost && !errorGet && !errorPost) {
            const fetchingPost = async () => {
                // localStorage.removeItem("posts");
                setPosts(null);
                setHasMore(true);
                await getFeedPageData(0);
            };
            fetchingPost();
        }
    }, [feedValue, account]);

    const getStoredPosts = (feed:string): Post[] | null => {
        const storedPosts = localStorage.getItem(`posts${feed}`);
        if (storedPosts)
            return JSON.parse(storedPosts);
        else
            return null;
    };

    const setStoredPosts = (comingPosts: Post[]) => {
        
        let storedPosts = [];
        storedPosts = [...(posts || [])];

        let newPosts: Post[] = [];
        // check if any post from coming post is exist in posts
        comingPosts.map((post) => {
            if(!storedPosts?.includes(post))
                newPosts.push(post);
        });

        setPosts((prevPosts) => ([...(prevPosts || []), ...newPosts]));
        // localStorage.setItem(`posts${feedValue}`, JSON.stringify([...(posts || []), ...newPosts]));
        // localStorage.setItem("LastFetchDate", new Date().toISOString());
    };

    const fetchPosts = useCallback(async (page:number = 0) => {
        if(page === 0){
            setHasMore(true);
            setPosts(null);
        }
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}posts?feedValue=${feedValue}&tagValue=${tagValue}&offset=${page * 10}`, {
                credentials: "include",
            });
        });

        if(result){
            setStoredPosts(result);
            if(result.length < 10)
                setHasMore(false);
            return result;
        }
        else{
            setHasMore(false);
            return null;
        }

    }, [getData, fetchWithAuth]);

    const getFeedPageData = useCallback(async (page:number) => {
        await fetchPosts(page);
    }, [fetchPosts]);

    const fetchPostWithID = useCallback(async (postId: string) => {
        const result = await fetchWithAuth(async () => {
            return await getData(`${BASEURL}posts/${postId}`, {
                credentials: "include",
            });
        });

        if (result) {
            setStoredPosts([result]);
            return result;
        }
        else
            return null;

    }, [getData, fetchWithAuth]);

    const deletePost = useCallback(async (postId: string) => {
        const result = await fetchWithAuth(async () => {
            return await deleteData(`${BASEURL}posts/${postId}`, {credentials: "include",})
        });

        if(result){
            // Delete exist post from saved posts
            setPosts((prevPosts) => {
                if (!prevPosts) return prevPosts;
                return prevPosts.filter((post) => post.id !== postId);
            });
            localStorage.setItem("posts", JSON.stringify(posts?.filter((post) => post.id !== postId)));
        }

        return true;
    }, [fetchWithAuth, deleteData])

    const searchPosts = async (options: PostSearchOptions) => {
        // Check if post stored locally.
        // const storedPosts = getLocalStoragedPosts();
        if (options.id) {
            await fetchPostWithID(options.id);
        }
    };

    const fetchCommentWithId = useCallback((commentID: string) => {
        const result = fetchWithAuth(async () => {
            return await getData(`${BASEURL}comments/${commentID}`, {
                credentials: "include",
            });
        });

        if (result)
            return result;
        else
            return null;
    }, [getData, fetchWithAuth])

    const createPost = useCallback(async (content: string, tags?: string[], image_url?: string,) => {
        const result: Post = await fetchWithAuth(async () => {
            return await postData(`${BASEURL}posts`, {
                content,
                image_url,
                tags,
            }, {
                credentials: "include",
            });
        });

        if (result && feedValue === "Latest") {
            const postTemp = posts || [];
            // set as first element
            postTemp.unshift(result);
            setPosts(postTemp);
        }
    }, [postData, fetchWithAuth]);

    const likeComment = useCallback(async (commentID: string) => {
        const result = await fetchWithAuth(async () => {
            return await postData(`${BASEURL}comments/${commentID}/like`, {}, {
                credentials: "include",
            });
        });

        if (result) {
            const likeResult: LikeType = result;

            setPosts((prevPosts) => {
                if (!prevPosts) return prevPosts;
                return prevPosts.map((post) => {
                    post.comments.forEach((comment) => {
                        if (comment.id === commentID) {
                            comment.is_liked = likeResult.liked;
                            // Somehow it is increasing the likes count x2
                            // comment.likes = likeResult.liked ? [...comment.likes, comment.author_id] : comment.likes.filter((id) => id !== comment.author_id);
                            if (likeResult.liked) {
                                if (!comment.likes.includes(comment.author_id))
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
        const result = await fetchWithAuth(async () =>
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
        const result = await fetchWithAuth(async () => {
            return await postData(`${BASEURL}accounts/follow/${accountID}`, {}, {
                credentials: "include",
            });
        });

        if (result) {
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
        else {
            return false;
        }

    }, [postData, fetchWithAuth])

    const addComment = useCallback(async (content: string, postId?: string, parent_comment_id?: string) => {
        //  console.log(`content: ${content}, postId: ${postId}, parent_comment_id: ${parent_comment_id}`);
        const isChildComment = parent_comment_id?.trim() !== "";
        // TO DO: check if adding sub comment or main comment to post
        const URL = isChildComment ? `${BASEURL}comments/${parent_comment_id}/comment` : `${BASEURL}posts/${postId}/comment`;

        const result: Comment = await fetchWithAuth(async () => {
            const result = await postData(URL, {
                content,
                parent_comment_id,
            }, {
                credentials: "include",
            });

            return result;
        });

        if (result) {
            // console.log(JSON.stringify(result));
            setPosts((prevPosts) => {
                if (!prevPosts) return prevPosts;

                return prevPosts.map((post) => {
                    if (post.id !== postId) return post;
                    // If it's a child comment, find the parent comment to add the new comment
                    const updatedComments = [...post.comments, result];
                    if (isChildComment) {
                        const parentComment = updatedComments.find(c => c.id === parent_comment_id);
                        if (parentComment) {
                            const updatedChildComments = [...(parentComment.child_commets || []), result.id];

                            return {
                                ...post,
                                comments: post.comments.map(comment =>
                                    comment.id === parent_comment_id ? {
                                        ...comment,
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
    const fetchAccountWithId = useCallback(async (account_id: string) => {
        const result: Post[] = await fetchWithAuth(async () => {
            // return await getData(`${BASEURL}/accounts/profile/${account_id}`, {
            //     credentials:"include",
            // });
            return await getData(`${BASEURL}/accounts/profile/${account_id}/posts`, {
                credentials: "include",
            });
        });

        if (result) {
            setStoredPosts(result);
        }

    }, [getData, fetchWithAuth]);

    const setNullEachError = () => {
        setErrorPost(null);
        setErrorAuth(null);
        setErrorPatch(null);
        setErrorDelete(null);
        setNullEachErrorAuth();
    }

    return (
        <PostContext.Provider value={{
            posts, 
            hasMore,
            isLoading: isLoadingPost || isLoadingGet || isLoadingPatch || isLoadingDelete,
            error: errorPost || errorGet || errorPatch || errorDelete,
            createPost,
            deletePost,
            likePost,
            addComment,
            likeComment,
            searchPosts,
            // editPost,
            fetchCommentWithId,
            followAccount,
            fetchAccountWithId,
            getFeedPageData,
            feedValue,
            tagValue,
            setFeedValue,
            setTagValue,
            setNullEachError,
        }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePostContext = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error("usePostContext must be used within a PostProvider");
    }

    return context;
};