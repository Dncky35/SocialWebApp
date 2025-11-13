'use client';
import { useParams } from "next/navigation";
import React, { useEffect } from 'react';
import { usePostContext } from "@/context/PostContext";
import PostCard from "@/components/Posts/PostCard";
import CommentCard from "@/components/Posts/CommentCard";
import LoadingComponent from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import ErrorDisplay from "@/components/ErrorDisplay";

const PostPage:React.FC = () => {
    const params = useParams(); // postid
    const { posts, isLoading, searchPosts, error } = usePostContext();
    const post = posts?.find((p) => p.id === params.postid) || null;
    const { pageState } = useAuth();

    useEffect(() => {
        if(!post && !isLoading && !error){
            const fetchPost = async () => {
                await searchPosts({id: params.postid as string});
            };

            fetchPost();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post, error, isLoading]);

    if(isLoading || pageState === "Initializing")
        return ( <LoadingComponent />);

    if(post === null){
        return (
            <div>
                <p>Post not found</p>
            </div>
        );
    }

    return (
        <div className="flex-grow w-full max-w-2xl mx-auto rounded-2xl shadow-2xl p-6">
            <div className="w-[calc(100%-20px)] ml-auto space-y-4 mt-4">
                {error && (
                    <ErrorDisplay error={error || undefined} />
                )}
                <PostCard post={post} />
                {post.comments.length > 0 && post.comments.map((comment, index) => {
                    if(comment.parent_comment_id)
                        return null;

                    return (
                        <div key={index} className="w-[calc(100%-30px)] ml-auto">
                            <CommentCard comment={comment} />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default PostPage;

