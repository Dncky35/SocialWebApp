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

const FeedPage: React.FC = () => {
  const { posts, isLoading: isLoadingPost, setFeedValue, setTagValue, feedValue, tagValue, error: errorPost, getFeedPageData } = usePostContext();
  const { pageState, isLoading: isLoadingAuth, error: errorAuth } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedFeedValue = localStorage.getItem("feedValue");
    if (storedFeedValue) setFeedValue(storedFeedValue);
    setHydrated(true);
  }, [setFeedValue]);

  useEffect(() => {
    if (!hydrated) return;

    if (!posts && !isLoadingPost && !isLoadingAuth && !errorPost) {
      const fetchingPosts = async () => await getFeedPageData();
      fetchingPosts();
    }
  }, [posts, errorPost, hydrated]);

  if (isLoadingPost || isLoadingAuth || pageState === "Initializing")
    return <LoadingComponent />;

  const handleOnValueChange = (listName: ListName, value: string) => {
    if (listName === "Tags") {
      setTagValue(value);
      localStorage.setItem("tagValue", value);
    }

    if (listName === "Feed") {
      setFeedValue(value);
      localStorage.setItem("feedValue", value);
    }
  };

  return (
    <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-2xl shadow-xl bg-slate-950/60 backdrop-blur-md mt-4 mb-4">
      {errorPost && <ErrorDisplay error={errorAuth || errorPost || undefined} />}

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 p-2">
        <div className="pb-2 px-2 bg-slate-900/70 rounded-xl shadow-inner">
          <label className="text-gray-300 text-sm font-semibold italic">Feed:</label>
          <select
            value={feedValue}
            onChange={(e) => handleOnValueChange("Feed", e.target.value)}
            className="bg-slate-800/70 rounded p-2 w-full text-gray-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 transition"
          >
            {FeedOptions.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex items-center gap-x-2 bg-slate-900/70 rounded-xl py-2 px-2 shadow-inner">
          <input
            className="w-full text-gray-100 bg-slate-800/60 rounded py-2 px-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 transition"
            type="text"
            placeholder="Search"
          />
          <button className="cursor-pointer rounded-full bg-gradient-to-b from-cyan-500 to-violet-500 p-2 shadow-lg text-white hover:scale-105 hover:opacity-90 transition-transform">
            <Search />
          </button>
        </div>

        <div className="pb-2 px-2 bg-slate-900/70 rounded-xl shadow-inner">
          <label className="text-gray-300 text-sm font-semibold italic">Tag:</label>
          <select
            value={tagValue}
            onChange={(e) => handleOnValueChange("Tags", e.target.value)}
            className="bg-slate-800/70 rounded p-2 w-full text-gray-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 transition"
          >
            {tagList.map((tag, index) =>
              tag === "" ? (
                <option key={index} value="">
                  Select Tag
                </option>
              ) : (
                <option key={index}>{tag}</option>
              )
            )}
          </select>
        </div>
      </div>

      <hr className="border-gray-700" />

      {/* Posts */}
      <div className="space-y-4">
        <PostCreator />
        <hr className="border-gray-700" />
        <div className="w-full max-w-xl mx-auto space-y-4">
          {posts && posts.map((post: Post, index) => <PostCard key={index} post={post} />)}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
