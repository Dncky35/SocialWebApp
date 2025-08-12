"use client";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";
import CommentCard, { Comment } from "@/components/Comment";
import { useParams } from "next/navigation";
import LoadingComponent from "@/components/Loading";

const CommentsPage:React.FC = () => {
    const params = useParams();
    const { posts, fetchCommentWithId, isLoading } = usePostContext();
    const [comment, setComment] = useState<Comment | null>(() => {
        const _post = posts.find((p) => p.id === params.postid);
        const _comment = _post?.comments.find((c) => c.id === params.commnetId);
        return _comment || null;
    });

    useEffect(() => {
        if(comment)
            return;

        const fetchComment = async () => {
            const result = await fetchCommentWithId(params.commnetId as string);

            if(result)
                setComment(result);
            else
                setComment(null);
        };

        fetchComment();

    }, [comment]);

    if(isLoading)
        return ( <LoadingComponent />);
    
    if(comment === null){
        return (
            <div>
                <p>Comment not found</p>
            </div>
        );
    }

    return(
        <div className="flex-grow w-full max-w-2xl mx-auto rounded-2xl shadow-2xl p-6">
            <button className="bg-emerald-500 rounded py-1 px-4 cursor-pointer hover:bg-emerald-600 text-white font-semibold transition duration-300">
                Back to Post
            </button>
            <div>
                <CommentCard comment={comment} />
                <div>
                    { comment.child_commets?.map((c,index) => (
                        <div key={index}>{c.content}</div>
                    ))}
                </div>
                
            </div>
        </div>
    );
};

export default CommentsPage;