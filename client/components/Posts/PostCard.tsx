"use client";
import React, { useState } from "react";
import { PublicAccount } from "@/schemas/account";
import Link from "next/link";
import { Comment } from "./CommentCard";
import { usePostContext } from "@/context/PostContext";
import { useAuth } from "@/context/AuthContext";
import CommentCreator from "./CommentCreator";
import { MessageSquarePlus, Heart, Pencil, Eraser, Redo2 } from "lucide-react";
import { motion } from "motion/react";

export interface Post {
  id: string;
  content: string;
  image_url: string;
  tags: string[];
  likes: string[];
  is_liked?: boolean;
  comments: Comment[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  owner: PublicAccount;
}

interface PostProps {
  post: Post;
}

const PostCard: React.FC<PostProps> = ({ post }) => {
  const { likePost, deletePost } = usePostContext();
  const { account } = useAuth();
  const [isCommentAdding, setIsCommentAdding] = useState(false);
  const isOwnPost = account && account.id === post.owner.id;
  const [isEditing, setIsEditing] = useState(false);

  const handleOnLike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    await likePost(post.id);
  };

  const handleOnDeleteClicked = async () => {
    // TO DO: show warning message to inform user that the post about to deleting.
    await deletePost(post.id);
  };

  return (
    <motion.div
      initial={{ y: 40, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{duration: .2}}
      className={`rounded-2xl shadow-xl px-4 py-3 w-full transform transition duration-300 hover:scale-[1.02] 
      ${isOwnPost
          ? "bg-gradient-to-br from-sky-600 to-violet-800"
          : "bg-gradient-to-br from-sky-700 to-violet-900"
        }`}
    >
      {/* Header */}
      <div className="border-b border-slate-700 py-1 mb-2 flex justify-between items-center">
        <Link
          href={`/profile/${post.owner.id}`}
          className="font-semibold text-lg text-gray-100 cursor-pointer hover:underline"
        >
          {post.owner.username}
        </Link>
        {isOwnPost && (
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <div className="flex items-center justify-evenly space-x-2">
                <button className="hover:scale-105 cursor-pointer" onClick={() => handleOnDeleteClicked()} ><Eraser /></button>
                <button className="hover:scale-105 cursor-pointer" onClick={() => setIsEditing((prev) => !prev)}><Redo2 /></button>
              </div>
            ) :
              (
                <button
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="cursor-pointer hover:underline text-gray-200"
                >
                  <Pencil />
                </button>)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col mb-2">
        <Link
          href={`/posts/${post.id}`}
          className="text-lg sm:text-xl font-semibold whitespace-pre-wrap break-words text-gray-100 hover:text-cyan-300 transition"
        >
          {post.content}
        </Link>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="text-sm cursor-pointer text-cyan-300 hover:text-violet-400 transition"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Likes & Comments */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex space-x-4 items-center">
          <div className="flex items-center gap-x-2 bg-slate-900/70 px-2 py-1 rounded-xl shadow-inner">
            <p className="text-sm text-gray-300 cursor-default">{post.likes.length}</p>
            <button
              onClick={handleOnLike}
              className="hover:scale-110 cursor-pointer transition transform"
            >
              {post.is_liked ? <Heart color="red" /> : <Heart color="white" />}
            </button>
          </div>
          <div className="flex items-center gap-x-2 bg-slate-900/70 px-2 py-1 rounded-xl shadow-inner">
            <p className="text-sm text-gray-300 cursor-default">{post.comments.length}</p>
            <button
              onClick={() => setIsCommentAdding((prev) => !prev)}
              className="hover:scale-110 cursor-pointer transition transform"
            >
              <MessageSquarePlus color="white" size={20} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Posted on: {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Comment Creator */}
      {isCommentAdding && <CommentCreator postID={post.id} />}
    </motion.div>
  );
};

export default PostCard;
