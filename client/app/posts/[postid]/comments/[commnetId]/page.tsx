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

    const [childComments, setChildComments] = useState<Comment[]>([]);

    // Fetch main comment if null 
    useEffect(() => {
        if(comment)
            return;

        const fetchComment = async () => {
            const result = await fetchCommentWithId(params.commnetId as string);

            if(result){
                const fetchChildComments = async() => {
                    if(!result.child_commets) return;

                    const childCommentPromises = result.child_commets.map(() => {
                        return fetchCommentWithId(result.child_commets[0]);
                    
                    });
                    const fetchedComments = await Promise.all(childCommentPromises);
                    const validComments = fetchedComments.filter((comment) => comment !== null);
                    setChildComments(validComments);
                }; 
                fetchChildComments();
                setComment(result);
            }
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
                ≪ Back
            </button>
            <div className="bg-emerald-900">
                <CommentCard comment={comment} />                
                <div className="w-[calc(100%-20px)] ml-auto px-2">

                    {childComments.map((comment, index) => (
                    <div key={index} className="border-b border-emerald-700 py-2">
                        <CommentCard  comment={comment} />
                    </div>
                ))}
                </div>
            </div>
        </div> 
    );
};

export default CommentsPage;