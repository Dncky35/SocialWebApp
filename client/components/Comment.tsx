"use client";
import React from "react";

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

const CommentCard:React.FC = () => {

    return (
        <div>

        </div>
    );
};

export default CommentCard;