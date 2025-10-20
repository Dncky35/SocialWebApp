"use client";
import { useState } from "react";
import { usePostContext } from "@/context/PostContext";
import LoadingComponent from "@/components/Loading";

interface CommentRequest {
  content: string;
  parent_comment_id?: string;
}

interface CommentCreatorProps {
  postID: string;
  commentID?: string;
}

const CommentCreator: React.FC<CommentCreatorProps> = ({
  postID,
  commentID = "",
}) => {
  const { addComment, isLoading } = usePostContext();
  const [commentForm, setCommentForm] = useState<CommentRequest>({
    content: "",
    parent_comment_id: commentID,
  });

  const handleOnContentChange = (value: string) => {
    setCommentForm((prev) => ({ ...prev, content: value }));
  };

  const handleOnPublish = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    await addComment(commentForm.content, postID || "", commentForm.parent_comment_id);
  };

  return (
    <div className="space-y-3 bg-slate-950/70 backdrop-blur-md p-4 rounded-xl shadow-md border border-slate-800">
      {isLoading && <LoadingComponent />}

      <label htmlFor="comment" className="text-gray-100 font-semibold text-md sm:text-lg">
        Add your comment:
      </label>
      <hr className="border-slate-700" />

      <textarea
        id="comment"
        name="comment"
        className="w-full h-24 sm:h-32 p-4 rounded-xl bg-slate-800 text-gray-100 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
        placeholder="What's on your mind?"
        maxLength={500}
        value={commentForm.content}
        onChange={(e) => handleOnContentChange(e.target.value)}
      />

      <button
        onClick={handleOnPublish}
        className="w-full bg-gradient-to-br from-cyan-500 to-violet-500 hover:scale-105 text-white font-semibold py-2 rounded-xl shadow-lg transition duration-300"
      >
        Share
      </button>
    </div>
  );
};

export default CommentCreator;
