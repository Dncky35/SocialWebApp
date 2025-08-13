"use client";
import React, { useEffect, useState } from "react";
import { usePostContext } from "@/context/PostContext";
import CommentCard, { Comment } from "@/components/CommentCard";
import { useParams } from "next/navigation";
import LoadingComponent from "@/components/Loading";
import { Post } from "@/components/PostCard";

const CommentsPage:React.FC = () => {
    const params = useParams();
    const { posts, fetchCommentWithId, isLoading } = usePostContext();
    const [post, setPost] = useState<Post|null>(null);
    const [comment, setComment] = useState<Comment|null>(null);
    const [childComments, setChildComments] = useState<Comment[]>([]);

    // Fetch main comment if null 
    useEffect(() => {
        if(posts.length === 0){
            const fetchComment = async () => {
                // TO DO: FETCH POST with postid and add posts on postContext
                
            }
        }
        else{
            // Find the post
            const _post = posts.find((p) => p.id === params.postid) || null;
            setPost(_post);

            if(_post){
                const _comment = _post.comments.find((c) => c.id === params.commentId) || null;
                setComment(_comment);
                const _childComments = _post.comments.filter((c) => c.parent_comment_id === params.commentId);
                setChildComments(_childComments);
            }
        }
        

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
            {/* <button className="bg-emerald-500 rounded py-1 px-4 cursor-pointer hover:bg-emerald-600 text-white font-semibold transition duration-300">
            ≪ Back
            </button> */}
            <CommentCard comment={comment} />                
            <div className="w-[calc(100%-30px)] ml-auto mt-4 space-y-4">
                {childComments.map((comment, index) => (
                    <div key={index} className="">
                        <CommentCard  comment={comment} />
                    </div>
                ))}
            </div>
        </div> 
    );
};

export default CommentsPage;