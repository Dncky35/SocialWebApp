"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";
import { useAuth } from "@/context/AuthContext";
import CommentCreator from "@/components/Posts/CommentCreator";
import LoadingComponent from "../Loading";
import { MessageSquarePlus, Heart } from "lucide-react";

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
    author_id: string
    post_id: string;
    parent_comment_id?: string;
    child_commets?: string[];
    likes: string[];
    like_counter?: number;
    is_liked: boolean;
}

interface CommentProps {
    comment: Comment;
};

const CommentCard: React.FC<CommentProps> = ({ comment }) => {

    const { error: errorAuth, isLoading: isLoadingAUTH, account } = useAuth();
    const { fetchAccountWithId, posts, likeComment, error: errorPost, isLoading: isLoadingPOST } = usePostContext();
    const owner = posts?.find((post) => post.owner.id === comment.author_id)?.owner || null;
    const [isCommentAdding, setIsCommentAdding] = useState(false);
    const isOwnComment = account && account.id === comment.author_id;
    // const [commentContent, setCommentContent] = useState<string>(comment.content);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!owner && !isLoadingPOST && !isLoadingAUTH && !errorAuth && !errorPost) {
            const getAccount = async () => {
                await fetchAccountWithId(comment.author_id);
            };
            getAccount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [owner, fetchAccountWithId, errorAuth, errorPost]);

    const handleOnLike = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await likeComment(comment.id);
        // console.log(result);
    };

    if (isLoadingAUTH || isLoadingPOST) {
        return (
            <LoadingComponent />
        );
    }

    const handleOnSaveEdit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
    };

    return (
        <div className={`bg-gradient-to-br ${isOwnComment ? "from-teal-600 to-teal-800" : "from-teal-700 to-teal-900"} 
        rounded shadow-xl px-4 py-2 hover:scale-[1.01] transform transition duration-300 w-full`}>
            <div className='border-b border-teal-700 py-1 mb-1 flex items-center justify-between'>
                <Link href={`/profile/${comment.author_id}`} className='font-semibold text-lg text-teal-300 cursor-pointer hover:underline'>
                    {owner?.username || comment.author_id}
                </Link>
                {isOwnComment && (
                    <button
                        onClick={() => setIsEditing((prev) => !prev)}
                        className='cursor-pointer hover:underline'>
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                )}
            </div>
            <Link href={`/posts/${comment.post_id}/comments/${comment.id}`} className='cursor-pointer text-xl font-semibold whitespace-pre-wrap break-words mb-2'>
                {comment.content}
                {isEditing && (
                    <div>
                        <p className='text-sm text-teal-300'>Delete button will be here soon</p>
                    </div>
                )}
            </Link>

            <div className="flex items-center justify-between border-t border-teal-700 py-2">
                <div className="flex items-center gap-x-4">
                    <div className='flex items-center gap-x-2 bg-teal-900 rounded-xl px-2 py-1'>
                        <p>{comment.likes?.length || 0}</p>
                        <button
                            onClick={(e) => handleOnLike(e)}
                            className='hover:scale-[1.1] cursor-pointer transition duration-300 transform'>
                            {comment.is_liked ? <Heart color="red" /> : <Heart />}
                        </button>
                    </div>
                    <div className='flex items-center gap-x-2 bg-teal-900 rounded-xl px-2 py-1'>
                        <p>{comment.child_commets?.length || 0}</p>
                        <button
                            onClick={() => setIsCommentAdding(prev => !prev)}
                            className='hover:scale-[1.1] cursor-pointer transition duration-300 transform'>
                            <MessageSquarePlus size={24} />
                        </button>
                    </div>
                </div>
                <p className='text-sm text-teal-300'>Posted On: {new Date(comment.created_at).toLocaleDateString()}</p>
            </div>
            <div className='mt-2 py-2 px-4 border-t border-teal-700'>
                {isCommentAdding && (
                    <CommentCreator commentID={comment.id} postID={comment.post_id} />
                )}
            </div>
        </div>
    );
};

export default CommentCard;