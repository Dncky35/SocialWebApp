"use client";
import React, { useEffect } from "react";
import { usePostContext } from "@/context/PostContext";
import PostCard, { Post } from "@/components/PostCard";
import PostCreator, { tagList } from "@/components/PostCreator";
import LoadingComponent from "@/components/Loading";
import ErrorComponent from "@/components/Error";
import { useAuth } from "@/context/AuthContext";

const FeedOptions = ["Latest", "Following", "Trending"];
type ListName = "Feed" | "Tags";

const FeedPage:React.FC = () => {
    const { posts, isLoading: isLoadingPost, error:errorPost, fetchPosts, setError } = usePostContext();
    const { pageState, isLoading: isLoadingAuth, error: errorAuth } = useAuth();
    const [feedValue, setFeedValue] = React.useState<string>(FeedOptions[0]);
    const [tagValue, setTagValue] = React.useState<string>(tagList[0]);

    useEffect(() => {
       if(!posts && !isLoadingPost && !isLoadingAuth && !errorPost) {
            const fetchingposts = async () => {
                await fetchPosts();
            }

            fetchingposts();
        }

    }, [posts, errorPost]);

    if(errorPost)
        return (<ErrorComponent status={errorPost.status} detail={errorPost.detail} setError={setError} />);

    if(isLoadingPost || isLoadingAuth)
        return (<LoadingComponent />);

    if( pageState === "Initializing"){
        return (<LoadingComponent />);
    }

    const handleOnValueChange = ( listName:ListName, value:string) => {
        if(listName === "Tags"){
            setTagValue(value);
        }
        
        if(listName === "Feed"){
            setFeedValue(value);
        }
    };

    return (
        <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-xl shadow-xl bg-emerald-800/50 backdrop-blur-sm mt-2 mb-2">
            <div className="bg-gradient-to-b from-emerald-800 to-emerald-700 grid grid-cols-4 gap-4 p-2 rounded-xl shadow-inner">
                    <div className="p-2 bg-emerald-800 rounded-xl">
                        <select
                        value={feedValue} 
                        onChange={(e) => handleOnValueChange("Feed", e.target.value)}
                        className="bg-emerald-100 rounded p-2 w-full shadow-inner text-emerald-950">
                            {FeedOptions.map((option, index) => (
                                <option key={index}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-x-2 bg-emerald-800 rounded-xl py-2 px-2 shadow-inner">
                        <input className="w-full text-emerald-950 bg-emerald-100 rounded py-2 px-4 shadow-inner " type="text" placeholder="Search" />
                        <button className="cursor-pointer rounded-full bg-gradient-to-b 
                        from-emerald-500 to-emerald-600 p-2 shadow-inner text-white hover:opacity-80 hover:shadow-none hover:scale-105">🔎</button>
                    </div>
                    <div className="p-2 bg-emerald-800 rounded-xl">
                        <select 
                        value={tagValue} 
                        onChange={(e) => handleOnValueChange("Tags", e.target.value)}
                        className="bg-emerald-100 rounded p-2 w-full shadow-inner text-emerald-950">
                            {tagList.map((tag, index) => (
                                <option key={index}>{tag}</option>
                            ))}
                        </select>
                    </div>
                </div>
            <div className="space-y-4">
                {/* TO DO: Add a header for filter, search and feed */}
                <PostCreator />
                <div className="w-full max-w-xl mx-auto space-y-4">
                    {posts && posts.map((post:Post, index) => (
                        <PostCard key={index} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );

};

export default FeedPage;