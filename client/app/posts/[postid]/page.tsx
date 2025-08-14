'use client';
import { useParams } from "next/navigation";
import React, { useEffect } from 'react';
import { usePostContext } from "@/context/PostContext";
import PostCard from "@/components/PostCard";
import CommentCard from "@/components/CommentCard";
import LoadingComponent from "@/components/Loading";
import ErrorComponent from "@/components/Error";

const PostPage:React.FC = () => {
    const params = useParams(); // postid
    const { posts, isLoading, fetchPostWithID, error, setError } = usePostContext();
    const post = posts?.find((p) => p.id === params.postid) || null;

    useEffect(() => {
        if (!post && !isLoading) {
            fetchPostWithID(params.postid as string);
        }
    }, [post, isLoading, params.postid, fetchPostWithID]);

    if(isLoading)
        return (<LoadingComponent />);

    if(error)
        return (<ErrorComponent status={error.status} detail={error.detail} setError={setError} />);

    if(post === null){
        return (
            <div>
                <p>Post not found</p>
            </div>
        );
    }

    return (
        <div className="flex-grow w-full max-w-2xl mx-auto rounded-2xl shadow-2xl p-6">
            <PostCard post={post} />
            <div className="w-[calc(100%-20px)] ml-auto space-y-4 mt-4">
                {post.comments.length > 0 && post.comments.map((comment, index) => {
                    if(comment.parent_comment_id)
                        return null;

                    return (
                        <CommentCard key={index} comment={comment} />
                    )
                })}
            </div>
        </div>
    );
};

export default PostPage;

