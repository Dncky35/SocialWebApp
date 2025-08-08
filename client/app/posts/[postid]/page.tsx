'use client';
import { useParams } from "next/navigation";
import React, { useState, useEffect } from 'react';
import { usePostContext } from "@/context/PostContext";
import PostCard, { Post } from "@/components/Post";
import CommentCard from "@/components/Comment";
import LoadingComponent from "@/components/Loading";
import ErrorComponent from "@/components/Error";

const PostPage:React.FC = () => {
    const params = useParams();
    const { posts, fetchPostWithID, isLoading, error, setError } = usePostContext();
    const [post, setPost] = useState<Post | null>(() => {
        return posts.find((p) => p.id === params.postid) || null;
    });

    useEffect(() => {
        if(post)
            return;

        const getPost = async () => {
            const result = await fetchPostWithID(params.postid as string);
            if(result)
                setPost(result);
        };

        getPost();

    }, [post]);

    return(
        <div className="flex-grow p-6 lg:w-full md:max-w-2xl mx-auto rounded-2xl shadow-2xl">
            {error && (
                <ErrorComponent status={error.status} detail={error.detail} setError={setError} />
            )}
            {post === null ? (
                <div>
                    <LoadingComponent />
                </div>
            ): (
                <div>
                    <PostCard post={post} />
                    <ul className="bg-emerald-900 px-6">
                        {post.comments?.map((comment, index) => {
                            if(comment.parent_comment_id !== null)
                                return null;

                            return (
                                <li key={index} className="border-b border-emerald-700 py-2" >
                                    <CommentCard comment={comment} />
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PostPage;

