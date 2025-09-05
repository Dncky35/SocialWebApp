"use client";
import React, { useEffect } from "react";
import { usePostContext } from "@/context/PostContext";
import CommentCard from "@/components/Posts/CommentCard";
import { useParams } from "next/navigation";
import LoadingComponent from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import ErrorDisplay from "@/components/ErrorDisplay";
import PostCard from "@/components/Posts/PostCard";

const CommentsPage:React.FC = () => {
    const params = useParams();
    const { pageState, isLoading:isLoadingAuth } = useAuth();
    const { posts, fetchCommentWithId, isLoading:isLoadingPost, error } = usePostContext();
    const post = posts?.find((p) => p.id === params.postid) || null;
    const comment = post?.comments.find((c) => c.id === params.commentId) || null;
    const childComments = post?.comments.filter((c) => c.parent_comment_id === params.commentId) || [];
    const parentComment = post?.comments.find((c) => c.id === comment?.parent_comment_id) || null;


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
            {/* <button className="bg-teal-500 rounded py-1 px-4 cursor-pointer hover:bg-teal-600 text-white font-semibold transition duration-300">
            ≪ Back
            </button> */}
            {error && (
                <ErrorDisplay error={error || undefined} />
            )}
            <div>
                {!comment.parent_comment_id && post && (
                   <PostCard post={post} />
                )}
                {parentComment && (
                    <CommentCard comment={parentComment} />
                )}
            </div>
            <div className="w-[calc(100%-10px)]  ml-auto mt-4">
                <CommentCard comment={comment} /> 
            </div>
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