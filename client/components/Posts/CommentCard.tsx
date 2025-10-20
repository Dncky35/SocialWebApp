"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";
import { useAuth } from "@/context/AuthContext";
import CommentCreator from "./CommentCreator";
import LoadingComponent from "../Loading";
import { MessageSquarePlus, Heart } from "lucide-react";

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  post_id: string;
  parent_comment_id?: string;
  child_commets?: string[];
  likes: string[];
  like_counter?: number;
  is_liked: boolean;
}

interface CommentProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentProps> = ({ comment }) => {
  const { error: errorAuth, isLoading: isLoadingAUTH, account } = useAuth();
  const { fetchAccountWithId, posts, likeComment, error: errorPost, isLoading: isLoadingPOST } = usePostContext();
  const owner = posts?.find((post) => post.owner.id === comment.author_id)?.owner || null;

  const [isCommentAdding, setIsCommentAdding] = useState(false);
  const isOwnComment = account && account.id === comment.author_id;
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!owner && !isLoadingPOST && !isLoadingAUTH && !errorAuth && !errorPost) {
      const getAccount = async () => {
        await fetchAccountWithId(comment.author_id);
      };
      getAccount();
    }
  }, [owner, fetchAccountWithId, errorAuth, errorPost, isLoadingPOST, isLoadingAUTH]);

  const handleOnLike = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await likeComment(comment.id);
  };

  if (isLoadingAUTH || isLoadingPOST) return <LoadingComponent />;

  return (
    <div
      className={`rounded-xl shadow-lg px-4 py-3 w-full transform transition duration-300 hover:scale-[1.02] 
      bg-gradient-to-br ${
        isOwnComment ? "from-sky-700 to-violet-900" : "from-cyan-700 to-cyan-900"
      }`}
    >
      {/* Header */}
      <div className="border-b border-slate-700 py-1 mb-2 flex items-center justify-between">
        <Link
          href={`/profile/${comment.author_id}`}
          className="font-semibold text-gray-100 cursor-pointer hover:underline"
        >
          {owner?.username || comment.author_id}
        </Link>
        {isOwnComment && (
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="cursor-pointer hover:underline text-gray-200"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {/* Content */}
      <Link
        href={`/posts/${comment.post_id}/comments/${comment.id}`}
        className="cursor-pointer text-gray-100 font-medium whitespace-pre-wrap break-words mb-2 hover:text-cyan-300 transition"
      >
        {comment.content}
        {isEditing && (
          <div>
            <p className="text-sm text-gray-400 mt-1">Delete button will be here soon</p>
          </div>
        )}
      </Link>

      {/* Likes & Replies */}
      <div className="flex items-center justify-between border-t border-slate-700 py-2">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2 bg-slate-900/70 rounded-xl px-2 py-1 shadow-inner">
            <p className="text-sm text-gray-300 cursor-default">{comment.likes?.length || 0}</p>
            <button
              onClick={handleOnLike}
              className="hover:scale-110 cursor-pointer transition transform"
            >
              {comment.is_liked ? <Heart color="red" /> : <Heart color="white" />}
            </button>
          </div>
          <div className="flex items-center gap-x-2 bg-slate-900/70 rounded-xl px-2 py-1 shadow-inner">
            <p className="text-sm text-gray-300 cursor-default">{comment.child_commets?.length || 0}</p>
            <button
              onClick={() => setIsCommentAdding((prev) => !prev)}
              className="hover:scale-110 cursor-pointer transition transform"
            >
              <MessageSquarePlus color="white" size={20} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Posted On: {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Nested Comment Creator */}
      {isCommentAdding && <CommentCreator postID={comment.post_id} commentID={comment.id} />}
    </div>
  );
};

export default CommentCard;
