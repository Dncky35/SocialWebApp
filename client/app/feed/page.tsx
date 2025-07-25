"use client";
import React, { use, useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";
import PostCard, { Post } from "@/components/Post";


interface PostCreationForm {
    content: string,
    image_url?: string,
    tags?: [string],
};

const FeedPage:React.FC = () => {
    const { posts, isLoading, error, fetchPosts, createPost } = usePostContext();
    const [postForm, setPostForm] = useState<PostCreationForm>({
        content: "",
        image_url: "",
        tags: [""],
    });
    const [ isExtended, setIsExtended ] = useState(false);

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if(error){
        return <div>Error: {error.detail}</div>;
    }

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

    const handleOnPublish = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await createPost(postForm.content, postForm.image_url);
    };


    return (
    <div className="bg-emerald-950 p-6 lg:w-full md:max-w-2xl mx-auto rounded-2xl shadow-2xl space-y-6">
        {isLoading && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl text-center text-lg font-semibold text-emerald-900">
                    Fetching posts...
                </div>
            </div>
        )}
        {/* Post Input Section */}
        <div className="bg-emerald-900 p-6 rounded-xl shadow-xl w-full max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <label
            htmlFor="post"
            className="text-white font-semibold text-lg"
            >
            Share your thoughts:
            </label>
            <button
            onClick={() => setIsExtended((prev) => !prev)}
            aria-label={isExtended ? "Collapse post input" : "Expand post input"}
            className={`transform transition-transform duration-300 ease-in-out text-white text-xl select-none`}
            style={{ rotate: isExtended ? "180deg" : "0deg" }}
            >
            ▼
            </button>
        </div>

        {isExtended && (
            <div className="space-y-4">
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
                onChange={(e) => handleOnImageChange(e)}
            />

            <button
                onClick={(e) => handleOnPublish(e)}
                className="w-full bg-emerald-500 py-3 rounded-lg text-white font-semibold hover:bg-emerald-600 transition-colors duration-300 ease-in-out"
            >
                Publish
            </button>
            </div>
        )}
        </div>


        {/* Posts List Placeholder */}
        <div className="w-full max-w-xl mx-auto">
            {posts.map((post: Post) => (
                <PostCard key={post._id} post={post} />
            ))}
        </div>
    </div>
    );

};

export default FeedPage;