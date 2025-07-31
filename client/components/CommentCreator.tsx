"use client";
import { useState } from "react";
import { usePostContext } from "@/context/PostContext";
import LoadingComponent from "./Loading";

interface CommentRequest {
    content: string;
    parent_comment_id?: string;
}

interface CommentCreatorProps {
    postID: string;
}


const CommentCreator:React.FC<CommentCreatorProps> = ({postID}:CommentCreatorProps) => {
    const { addComment, error, isLoading } = usePostContext();
    const [commentForm, setCommentForm] = useState<CommentRequest>({
        content: "",
        parent_comment_id: "",
    });

    const handleOnContentChange = (value:string) => {
        setCommentForm((prev) => {
            return {
                ...prev,
                content: value,
            };
        });
    };

    const handleOnPublish = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await addComment(postID, commentForm.content, commentForm.parent_comment_id);
    }

    return(
        <div className="space-y-4">
            {isLoading && (
                <LoadingComponent />
            )}

            <label htmlFor="post" className="text-white font-semibold text-lg">
                Add your comment:
            </label>
            <textarea  id="post"
                name="post"
                className="w-full h-32 p-4 rounded-lg bg-emerald-50 text-emerald-950 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="What's on your mind?"
                maxLength={500}
                value={commentForm.content}
                onChange={(e) => handleOnContentChange(e.target.value)}
            />
            <button
            onClick={(e) => handleOnPublish(e)} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white font-semibold py-2 rounded transition duration-200">
                Share
            </button>
        </div>
    );
};

export default CommentCreator;