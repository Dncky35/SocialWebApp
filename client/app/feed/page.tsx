"use client";
import React, { useEffect, useState } from "react";
import { usePostContext, FeedOptions, tagList } from "@/context/PostContext";
import PostCard, { Post } from "@/components/Posts/PostCard";
import PostCreator from "@/components/Posts/PostCreator";
import LoadingComponent from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { Search } from 'lucide-react'
import ErrorDisplay from "@/components/ErrorDisplay";

type ListName = "Feed" | "Tags";

const FeedPage:React.FC = () => {
    const { posts, isLoading: isLoadingPost, setFeedValue, setTagValue, feedValue, tagValue,  error:errorPost, getFeedPageData } = usePostContext();
    const { pageState, isLoading: isLoadingAuth, error: errorAuth } = useAuth();
    const [hydrated, setHydrated] = useState(false); // ✅ track client hydration,

    useEffect(() => {
        const storedFeedValue = localStorage.getItem("feedValue");
        if (storedFeedValue) {
            setFeedValue(storedFeedValue);
        }
        setHydrated(true); // ✅ mark hydration done
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setFeedValue]);

    useEffect(() => {
        if(!hydrated)
            return;

       if(!posts && !isLoadingPost && !isLoadingAuth && !errorPost) {
            const fetchingposts = async () => {
                await getFeedPageData();
            }

            fetchingposts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts, errorPost, hydrated]);

    if(isLoadingPost || isLoadingAuth || pageState === "Initializing")
        return (<LoadingComponent />);

    const handleOnValueChange = ( listName:ListName, value:string) => {
        if(listName === "Tags"){
            setTagValue(value);
            localStorage.setItem("tagValue", value);
        }
        
        if(listName === "Feed"){
            setFeedValue(value);
            localStorage.setItem("feedValue", value);
        }
    };

    return (
        <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-xl shadow-xl bg-sky-900/30 backdrop-blur-sm mt-2 mb-2">
            {errorPost && (
                <ErrorDisplay error={errorAuth || errorPost || undefined} />
            )}
            <div className="grid grid-cols-4 gap-4 p-2">
                    <div className="pb-2 px-2 bg-slate-900 rounded-xl">
                        <label className="text-slate-300 text-sm font-semibold italic">Feed:</label>
                        <select
                        value={feedValue} 
                        onChange={(e) => handleOnValueChange("Feed", e.target.value)}
                        className="bg-slate-100 rounded p-2 w-full shadow-inner text-slate-950">
                            {FeedOptions.map((option, index) => (
                                <option key={index}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-x-2 bg-slate-900 rounded-xl py-2 px-2 shadow-inner">
                        <input className="w-full text-slate-950 bg-slate-100 rounded py-2 px-4 shadow-inner " type="text" placeholder="Search" />
                        <button className="cursor-pointer rounded-full bg-gradient-to-b 
                        from-slate-500 to-slate-600 p-2 shadow-inner text-white hover:opacity-80 hover:shadow-none hover:scale-105"><Search /></button>
                    </div>
                    <div className="pb-2 px-2 bg-slate-900 rounded-xl">
                        <label className="text-slate-300 text-sm font-semibold italic">Tag:</label>
                        <select 
                        value={tagValue} 
                        onChange={(e) => handleOnValueChange("Tags", e.target.value)}
                        className="bg-slate-100 rounded p-2 w-full shadow-inner text-slate-950">
                            {tagList.map((tag, index) => {
                                if(tag === "")
                                    return (<option key={index} value="">Select Tag</option>);
                                return (
                                    <option key={index}>{tag}</option>
                                );
                            })}
                        </select>
                    </div>
            </div>
            <hr className="border-b border-slate-200"></hr>
            <div className="space-y-4">
                {/* TO DO: Add a header for filter, search and feed */}
                <PostCreator />
                <hr className="border-b border-slate-200"></hr>
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