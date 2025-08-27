"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";
import { useAuth } from "@/context/AuthContext";
import CommentCreator from "@/components/CommentCreator";
import LoadingComponent from "./Loading";
import { MessageSquarePlus, Heart } from "lucide-react";

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
    author_id:string
    post_id: string;
    parent_comment_id?:string;
    child_commets?:string[];
    likes:string[];
    like_counter?:number;
    is_liked: boolean;
}

interface CommentProps {
  comment: Comment;
};

const CommentCard:React.FC<CommentProps> = ({ comment }) => {

    const { error:errorAuth, isLoading:isLoadingAUTH } = useAuth();
    const { fetchAccountWithId, posts, likeComment, error:errorPost, isLoading:isLoadingPOST } = usePostContext();
    const owner = posts?.find((post) => post.owner.id === comment.author_id)?.owner || null;
    const [isCommentAdding, setIsCommentAdding] = useState(false);

    useEffect(() => {
        if(!owner && !isLoadingPOST && !isLoadingAUTH && !errorAuth && !errorPost){
            const getAccount = async () => {
                await fetchAccountWithId(comment.author_id);
            };
            getAccount();
        }

    }, [owner, fetchAccountWithId, errorAuth, errorPost]);

    const handleOnLike = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await likeComment(comment.id);
        // console.log(result);
    };

    if(isLoadingAUTH || isLoadingPOST){
        return (
            <LoadingComponent />
        );
    }

    return (
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded shadow-xl px-4 py-2 hover:scale-[1.01] transform transition duration-300 w-full">
           <div className='border-b border-emerald-700 py-1 mb-1'>
                <Link href={`/profile/${comment.author_id}`} className='font-semibold text-lg text-emerald-300 cursor-pointer hover:underline'>
                {owner?.username || comment.author_id}
                </Link>
            </div>
            <Link href={`/posts/${comment.post_id}/comments/${comment.id}`} className='cursor-pointer text-xl font-semibold whitespace-pre-wrap break-words mb-2'>
                {comment.content}
            </Link>
            <div className="flex items-center justify-between border-t border-emerald-700 py-2">
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <p>{comment.likes?.length || 0}</p>
                        <button 
                        onClick={(e) => handleOnLike(e)}
                        className='hover:scale-[1.1] cursor-pointer transition duration-300 transform'>
                            {comment.is_liked ? <Heart color="red" /> : <Heart />}
                        </button>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <p>{comment.child_commets?.length || 0}</p>
                        <button 
                        onClick={() => setIsCommentAdding(prev => !prev)}
                        className='hover:scale-[1.1] cursor-pointer transition duration-300 transform'>
                            <MessageSquarePlus size={24} />
                        </button>
                    </div>
                </div>
                <p className='text-sm text-emerald-300'>Posted On: {new Date(comment.created_at).toLocaleDateString()}</p>
            </div>
            <div className='mt-2 py-2 px-4 border-t border-emerald-700'>
            {isCommentAdding  && (
                <CommentCreator commentID={comment.id} postID={comment.post_id} />
            )}
        </div>
        </div>
    );
};

export default CommentCard;