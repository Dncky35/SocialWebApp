"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePostContext, FeedOptions } from "@/context/PostContext";
import PostCard, { Post } from "@/components/Posts/PostCard";
import PostCreator from "@/components/Posts/PostCreator";
import LoadingComponent from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { Search } from 'lucide-react'
import ErrorDisplay from "@/components/ErrorDisplay";
import { Tags } from "lucide-react";
import { motion } from "motion/react";

const FeedPage: React.FC = () => {
  const { posts, isLoading: isLoadingPost, setFeedValue, hasMore, feedValue, error: errorPost, getFeedPageData} = usePostContext();
  const { pageState, isLoading: isLoadingAuth, error: errorAuth } = useAuth();
  const [page, setPage] = useState(1);
  const loadingRef = useRef(false);

  useEffect(() => {
    const handleScrolling = async () => {
      if (isLoadingPost || isLoadingAuth || !hasMore || loadingRef.current) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 400;

      if (scrollPosition >= threshold) {
        loadingRef.current = true; // lock it immediately (sync)
        await getFeedPageData(page).finally(() => loadingRef.current = false);
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScrolling);
    return () => window.removeEventListener("scroll", handleScrolling);
  }, [isLoadingPost, hasMore, getFeedPageData, page]);

  if (pageState === "Initializing")
    return <LoadingComponent />;

  const onFeedChanged = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const value = e.currentTarget.value;
    setFeedValue(value);
    setPage(1);
    localStorage.setItem("feedValue", value);
  };

  return (
    <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-2xl shadow-xl bg-slate-950/60 backdrop-blur-md mt-4 mb-4">
      {errorPost && <ErrorDisplay error={errorAuth || errorPost || undefined} />}

      {/* Feed Options and Filters*/}
      <div>
        {/* Feed Options */}
        <div className="grid grid-cols-3 p-2 space-x-4">
          {FeedOptions.map((option, index) => (
            <button className={`bg-gradient-to-b ${feedValue === option ? "border-b-4 border-sky-500" : ""} 
              cursor-pointer py-2 rounded hover:scale-[1.1] transform transition duration-300 text-white text-lg`}
              value={option} key={index} onClick={(e) => onFeedChanged(e)}>
              {option}
            </button>
          ))}
        </div>
        {/* Filters */}
        <div className="flex flex-col my-2 py-1 border border-slate-700 rounded-lg">
          <p className="text-xs ml-5 text-slate-300">**currently under development</p>
          <div className="flex items-center justify-evenly">
            <div className="w-full col-span-2 flex items-center gap-x-2 bg-slate-900/70 rounded-xl py-2 px-2 shadow-inner">
              <input
                className="w-full text-gray-100 bg-slate-800/60 rounded py-2 px-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 transition"
                type="text"
                placeholder="Search people or posts..."
              />
              <button className="cursor-pointer rounded-full bg-gradient-to-b from-cyan-500 to-violet-500 p-2 shadow-lg text-white hover:scale-105 hover:opacity-90 transition-transform">
                <Search />
              </button>
              <button className="cursor-pointer rounded-full bg-gradient-to-b from-cyan-500 to-violet-500 p-2 shadow-lg text-white hover:scale-105 hover:opacity-90 transition-transform">
                <Tags />
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-gray-700" />

      {/* Posts */}
      <div className="space-y-4">
        <motion.div
          className="space-y-4">
          <PostCreator />
          <hr className="border-gray-700" />
          <div className="w-full max-w-xl mx-auto space-y-4">
            {posts && posts.map((post: Post, index) => <PostCard key={index} post={post} />)}
          </div>
        </motion.div>
      </div>
      {isLoadingPost ? (
        <motion.div>
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-violet-500 rounded-full animate-spin mx-auto shadow-lg shadow-cyan-600/50"></div>
        </motion.div>
      ) : null}

    </div>
  );
};

export default FeedPage;
