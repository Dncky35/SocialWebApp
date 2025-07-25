"use client";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";

interface Post {
    content: string,
    image_url?: string,
    tags?: [string],
};

const FeedPage:React.FC = () => {
    const { posts, isLoading, error, fetchPosts } = usePostContext();

    const [postForm, setPostForm] = useState<Post>({
        content: "",
        image_url: "",
        tags: [""],
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    if(isLoading){
        return <div>Loading...</div>;
    }

    if(error){
        return <div>Error: {error.detail}</div>;
    }

    console.log(posts)


    const handleOnContentChange = (value:string) => {
        setPostForm((prev) => {
            return {
                ...prev,
                content: value,
            };
        });
    };

    const handleOnImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    }

    return (
    <div className="bg-emerald-950 p-6 lg:w-full md:max-w-xl mx-auto rounded-2xl shadow-2xl space-y-6">
        {/* Post Input Section */}
        <div className="bg-emerald-900 p-6 rounded-xl shadow-xl space-y-4 w-full max-w-xl mx-auto">
            <label
                htmlFor="post"
                className="text-white font-semibold text-lg block"
            >
                Share your thoughts:
            </label>
            <textarea
                id="post"
                name="post"
                className="w-full h-32 p-4 rounded-lg bg-emerald-50 text-emerald-950 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="What's on your mind?"
                maxLength={500}
                value={postForm.content}
                onChange={(e) => handleOnContentChange(e.target.value)}
            />
            <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-emerald-900 bg-emerald-50 rounded-lg cursor-pointer 
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white hover:file:bg-emerald-600 file:cursor-pointer"
                value={postForm.image_url}
                onChange={(e) => handleOnImageChange(e)}
            />
        </div>

        {/* Posts List Placeholder */}
        <div className="w-full max-w-xl mx-auto">
        {/* Future posts will be listed here */}
        </div>
    </div>
    );

};

export default FeedPage;