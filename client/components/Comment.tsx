"use client";
import { PublicAccount } from "@/schemas/account";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
    author_id:string
    post_id: string;
    parent_comment_id?:string;
    child_commets?:Comment[];
    Likes?:string[];
    is_liked: boolean;
}

interface CommentProps {
  comment: Comment;
};

const CommentCard:React.FC<CommentProps> = ({ comment }) => {
    
    const { posts, likeComment } = usePostContext();
    const [owner, setOwner] = useState<PublicAccount | null>(() => {
        return posts.find((post) => post.owner.id === comment.author_id)?.owner || null;
    });

    useEffect(() => {
        if(owner)
            return;

        // TO DO: fetch owner info

    }, [owner]);

    const handleOnLike = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await likeComment(comment.id);
    };

    return (
        <div className="bg-emerald-800 rounded shadow-xl px-4 py-2">
           <div className='border-b border-emerald-700 py-1 mb-1'>
                <Link href={`/profile/${comment.author_id}`} className='font-semibold text-lg text-emerald-300 cursor-pointer hover:underline'>
                {owner?.username || comment.author_id}
                </Link>
            </div>
            <div className='text-xl font-semibold whitespace-pre-wrap break-words mb-2 cursor-default'>
                {comment.content}
            </div>
            <div className="flex items-center justify-between border-t border-emerald-700 py-2">
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <p>{comment.Likes?.length || 0}</p>
                        <button 
                        onClick={(e) => handleOnLike(e)}
                        className='bg-emerald-600 text-white px-1 py-1 cursor-pointer rounded-full hover:bg-emerald-700 transition duration-300'>
                            {comment.is_liked ? "❤️" : "🤍"}
                        </button>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <p>{comment.child_commets?.length || 0}</p>
                        <button className='bg-emerald-600 text-white px-1 py-1 cursor-pointer rounded-full hover:bg-emerald-700 transition duration-300'>
                            ✍
                        </button>
                    </div>
                </div>
                <p className='text-sm text-emerald-300'>Posted On: {new Date(comment.created_at).toLocaleDateString()}</p>
            </div>
            <div></div>
        </div>
    );
};

export default CommentCard;