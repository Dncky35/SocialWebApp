"use client";
import React, { useEffect } from "react";
import { usePostContext } from "@/context/PostContext";
import CommentCard from "@/components/CommentCard";
import { useParams } from "next/navigation";
import LoadingComponent from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

const CommentsPage:React.FC = () => {
    const params = useParams();
    const { pageState, isLoading:isLoadingAuth } = useAuth();
    const { posts, fetchCommentWithId, isLoading:isLoadingPost, error, setError } = usePostContext();
    const post = posts?.find((p) => p.id === params.postid) || null;
    const comment = post?.comments.find((c) => c.id === params.commentId) || null;
    const childComments = post?.comments.filter((c) => c.parent_comment_id === params.commentId) || [];

    useEffect(() => {
        if(!post && !isLoadingPost && !isLoadingAuth && !error) {
            const fetchPost = async () => {
                // await fetchPostWithID(params.postid as string);
            };

            fetchPost();
        }

        if(!comment && !isLoadingAuth && !isLoadingPost && !error){
            const fetchComment = async () => {
                await fetchCommentWithId(params.commentId as string);
            };

            fetchComment();
        }

    }, [post, comment, error]);

    if(isLoadingAuth || isLoadingPost || pageState === "Initializing")
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