'use client';
import { useParams } from "next/navigation";
import React, { useState, useEffect } from 'react';
import { usePostContext } from "@/context/PostContext";
import PostCard from "@/components/Post";
import CommentCard from "@/components/Comment";

const PostPage:React.FC = () => {
    const params = useParams();
    const { posts } = usePostContext();
    const post = posts.find((p) => p.id === params.postid) || null;

    if(post === null)
        return null;

    return(
        <div className="flex-grow p-6 lg:w-full md:max-w-2xl mx-auto rounded-2xl shadow-2xl">
            <PostCard post={post} />
            <ul className="bg-emerald-900 px-6">
                {post.comments?.map((comment, index) => (
                    <li key={index} className="border-b border-emerald-700 py-2" >
                        <CommentCard comment={comment} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PostPage;

