"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePostContext } from "@/context/PostContext";
import LoadingComponent from "@/components/Loading";
import PostCard from "@/components/Posts/PostCard";
import PrivateAccountCard from "@/components/Profile/PrivateAccountCard";
import CommentCard, { Comment } from "@/components/Posts/CommentCard";
import AccountEditor from "@/components/Profile/AccountEditor";
import ErrorDisplay from "@/components/ErrorDisplay";
import { motion } from "motion/react";

type Options = "Shared" |"Comments" | "Liked";
const options:Options[] = ["Shared", "Liked", "Comments"];

const ProfilePage:React.FC = () => {
    const { account, pageState, isLoading:isLoadingAuth, error:errorAuth} = useAuth();
    const { posts, isLoading:isLoadingPost, error:errorPost} = usePostContext();
    const userPosts = posts?.filter((post) => post.owner.id === account?.id) || null;
    const likedPosts = posts?.filter((post) => post.likes.includes(account?.id || "")) || null;
    const userComments:Comment[] = posts?.map((post) => post.comments).flat().filter((comment) => comment.author_id === account?.id) || [];
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [selectedOption, setSelectedOption] = useState<Options>(options[0]);

    if(pageState === "Initializing" || isLoadingAuth || isLoadingPost)
        return (<LoadingComponent />);

    if(!account)
    {
        return (<div>Account not found</div>);
    }
    // {isEditing && <AccountEditor />}
    return (
        <div className="flex-grow w-full">
            {isEditing && <AccountEditor account={account} setIsEditing={setIsEditing} />}
            <div className="flex-grow flex flex-col gap-y-4 p-4 w-full max-w-2xl mx-auto rounded-xl shadow-xl bg-slate-800/20 backdrop-blur-sm my-2">
                {errorPost && (
                    <ErrorDisplay error={errorPost || undefined} />
                )}
                <PrivateAccountCard account={account} setIsEditing={setIsEditing} />          
                <div className="space-y-4">
                    <div className="grid grid-cols-3 p-2 space-x-4">
                        {options.map((option, index) => (
                            <motion.button key={index} 
                            onClick={() => setSelectedOption(option)}
                            className={`bg-gradient-to-b ${ selectedOption !== option ? "" : "border-b-4 border-blue-500" } cursor-pointer py-2
                            rounded hover:scale-[1.1] transform transition duration-300 text-white text-lg`}>
                                {option}
                            </motion.button>
                        ))}
                    </div>
                    {selectedOption === "Shared" && userPosts?.map((post, index) => (
                        <PostCard key={index} post={post} />
                    ))}
                    {selectedOption === "Liked" && likedPosts?.map((post, index) => (
                        <PostCard key={index} post={post} />
                    ))}
                    {selectedOption === "Comments" && userComments?.map((comment, index) => (
                        <CommentCard key={index} comment={comment} />
                    ))}
                </div>
            </div>
        </div>
    );
};


export default ProfilePage;