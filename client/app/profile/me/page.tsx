"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePostContext } from "@/context/PostContext";
import LoadingComponent from "@/components/Loading";
import PostCard from "@/components/PostCard";
import PrivateAccountCard from "@/components/Profile/PrivateAccountCard";
import CommentCard, { Comment } from "@/components/CommentCard";

type Options = "Posts" |"Comments" | "Liked";
const options:Options[] = ["Posts", "Comments", "Liked"];

const ProfilePage:React.FC = () => {
    const { account, pageState, isLoading:isLoadingAuth } = useAuth();
    const { posts, isLoading:isLoadingPost } = usePostContext();
    const userPosts = posts?.filter((post) => post.owner.id === account?.id) || null;
    const userComments:Comment[] = posts?.filter((post) => {
        
        return post.comments.map((comment) => {
            if(comment.author_id === account?.id)
                return comment;
            else
                return null;
        });
    }).map((post) => post.comments).flat().filter((comment) => comment.author_id === account?.id) || [];

    const [selectedOption, setSelectedOption] = useState<Options>(options[0]);

    if(pageState === "Initializing" || isLoadingAuth || isLoadingPost)
        return (<LoadingComponent />)

    if(!account)
    {
        return null;
    }

    return (
        <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-xl shadow-xl bg-emerald-800/20 backdrop-blur-sm my-2">
            <PrivateAccountCard account={account} />
            <div className="space-y-4">
                <div className="grid grid-cols-3 p-2 space-x-4">
                    {options.map((option, index) => (
                        <button key={index} 
                        onClick={() => setSelectedOption(option)}
                        className={`${ selectedOption === option ? "bg-gradient-to-b from-emerald-600 to-emerald-900" : "bg-gradient-to-b from-emerald-900 to-emerald-600" } cursor-pointer py-2
                        rounded hover:scale-[1.1] transform transition duration-300 text-white text-lg`}>
                            {option}
                        </button>
                    ))}
                </div>
                {selectedOption === "Posts" && userPosts?.map((post, index) => (
                    <PostCard key={index} post={post} />
                ))}
                {selectedOption === "Comments" && userComments?.map((comment, index) => (
                    <CommentCard key={index} comment={comment} />
                ))}
            </div>
        </div>
    );
};


export default ProfilePage;