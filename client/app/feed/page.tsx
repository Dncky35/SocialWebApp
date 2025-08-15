"use client";
import React, { useEffect } from "react";
import { usePostContext } from "@/context/PostContext";
import PostCard, { Post } from "@/components/PostCard";
import PostCreator from "@/components/PostCreator";
import LoadingComponent from "@/components/Loading";
import ErrorComponent from "@/components/Error";
import { useAuth } from "@/context/AuthContext";

const FeedPage:React.FC = () => {
    const { posts, isLoading, error, fetchPosts, setError } = usePostContext();
    const { pageState } = useAuth();

    useEffect(() => {
       if(!posts && !isLoading && !error) {
            const fetchingposts = async () => {
                await fetchPosts();
            }

            fetchingposts();
        }

    }, [posts, error]);

    if(error)
        return (<ErrorComponent status={error.status} detail={error.detail} setError={setError} />);

    if(isLoading)
        return (<LoadingComponent />);

    if( pageState === "Initializing"){
        return (<LoadingComponent />);
    }

    return (
        <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-xl shadow-xl">
            <div>
                <PostCreator />
                <div className="w-full mt-4 max-w-xl mx-auto space-y-4">
                    {posts && posts.map((post:Post, index) => (
                        <PostCard key={index} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );

};

export default FeedPage;