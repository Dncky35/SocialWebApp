"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { usePostContext } from "@/context/PostContext";
import LoadingComponent from "@/components/Loading";
import PostCard from "@/components/Posts/PostCard";
import CommentCard, { Comment } from "@/components/Posts/CommentCard";
import PrivateAccountCard from "@/components/Profile/PrivateAccountCard";
import AccountEditor from "@/components/Profile/AccountEditor";
import ErrorDisplay from "@/components/ErrorDisplay";

type Options = "Shared" | "Comments" | "Liked";
const options: Options[] = ["Shared", "Liked", "Comments"];

const ProfilePage: React.FC = () => {
  const { account, pageState, isLoading: isLoadingAuth, error: errorAuth } = useAuth();
  const { posts, isLoading: isLoadingPost, error: errorPost } = usePostContext();

  const userPosts = posts?.filter((post) => post.owner.id === account?.id) || [];
  const likedPosts = posts?.filter((post) => post.likes.includes(account?.id || "")) || [];
  const userComments: Comment[] =
    posts?.map((post) => post.comments).flat().filter((comment) => comment.author_id === account?.id) || [];

  const [isEditing, setIsEditing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Options>("Shared");

  if (pageState === "Initializing" || isLoadingAuth || isLoadingPost) return <LoadingComponent />;
  if (!account) return <div className="text-center text-slate-300 py-8">Account not found.</div>;

  return (
    <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-4">
      {isEditing && <AccountEditor account={account} setIsEditing={setIsEditing} />}

      <div className="max-w-3xl mx-auto flex flex-col gap-y-6 bg-slate-900/40 backdrop-blur-md rounded-xl shadow-xl p-6">
        {/* Errors */}
        {(errorPost || errorAuth) && <ErrorDisplay error={errorPost || errorAuth || undefined} />}

        {/* Account Card */}
        <PrivateAccountCard account={account} setIsEditing={setIsEditing} />

        {/* Options Tabs */}
        <div className="flex justify-between gap-2">
          {options.map((option, idx) => (
            <motion.button
              key={idx}
              onClick={() => setSelectedOption(option)}
              className={`flex-1 py-2 rounded-lg text-lg font-semibold transition-transform duration-300
                ${
                  selectedOption === option
                    ? "bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg scale-105 text-white"
                    : "bg-slate-700/60 hover:bg-slate-700/80 text-slate-300 hover:scale-105"
                }`}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4 mt-4">
          {selectedOption === "Shared" && (
            <>
              {userPosts.length === 0 ? (
                <p className="text-center text-slate-300 py-4">You haven't shared any posts yet.</p>
              ) : (
                userPosts.map((post, idx) => <PostCard key={idx} post={post} />)
              )}
            </>
          )}

          {selectedOption === "Liked" && (
            <>
              {likedPosts.length === 0 ? (
                <p className="text-center text-slate-300 py-4">You haven't liked any posts yet.</p>
              ) : (
                likedPosts.map((post, idx) => <PostCard key={idx} post={post} />)
              )}
            </>
          )}

          {selectedOption === "Comments" && (
            <>
              {userComments.length === 0 ? (
                <p className="text-center text-slate-300 py-4">You haven't commented yet.</p>
              ) : (
                userComments.map((comment, idx) => <CommentCard key={idx} comment={comment} />)
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
