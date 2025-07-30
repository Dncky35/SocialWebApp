"use client";
import React, { useEffect } from "react";
import { usePostContext } from "@/context/PostContext";
import PostCard, { Post } from "@/components/Post";
import PostCreator from "@/components/PostCreator";


const FeedPage:React.FC = () => {
    const { posts, isLoading, error, fetchPosts } = usePostContext();

    useEffect(() => {
        if(posts.length > 0)
            return;
        
        const updateFeed = async () => {
            await fetchPosts();
        };

        updateFeed();
    }, [posts]);

    if(isLoading){
        return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl text-center text-lg font-semibold text-emerald-900">
                Fetching posts...
            </div>
        </div>
        );
    }

    return (
    <div className="flex-grow  p-6 lg:w-full md:max-w-2xl mx-auto rounded-2xl shadow-2xl space-y-6">
        {/* Post Input Section */}
        <div>
            <PostCreator />
        </div>

        {/* Posts List Placeholder */}
        <div className="w-full max-w-xl mx-auto">
            {error && (<div className="text-center font-bold">Error: {JSON.stringify(error)}</div>)}
            {posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    </div>
    );

};

export default FeedPage;