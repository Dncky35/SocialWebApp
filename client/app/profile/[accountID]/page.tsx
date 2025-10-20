'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePostContext } from "@/context/PostContext";
import PostCard from "@/components/Posts/PostCard";
import { useAuth } from "@/context/AuthContext";
import LoadingComponent from "@/components/Loading";
import ErrorDisplay from "@/components/ErrorDisplay";
import CommentCard, { Comment } from "@/components/Posts/CommentCard";

type Options = "Shared" | "Comments" | "Liked";
const options: Options[] = ["Shared", "Liked", "Comments"];

const ProfilePage: React.FC = () => {
    const params = useParams();
    const { isLoading, pageState, error: errorAuth } = useAuth();
    const { isLoading: isLoadingPost, fetchAccountWithId, posts, followAccount, error: errorPost } = usePostContext();

    const account = posts?.find((post) => post.owner.id === params.accountID)?.owner || null;
    const postsOfUser = posts?.filter((post) => post.owner.id === params.accountID) || null;
    const likedPosts = posts?.filter((post) => post.likes.includes(account?.id || "")) || null;
    const userComments: Comment[] = posts?.map((post) => post.comments).flat().filter((comment) => comment.author_id === account?.id) || [];
    const [selectedOption, setSelectedOption] = useState<Options>(options[0]);

    useEffect(() => {
        if (isLoading || errorAuth || errorPost || isLoadingPost)
            return;

        if (account === null) {
            const fetchAccount = async () => await fetchAccountWithId(params.accountID as string);
            fetchAccount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, errorPost, errorAuth]);

    if (isLoading || isLoadingPost || pageState === "Initializing" || !posts || !account)
        return (
            <div>
                <LoadingComponent />
            </div>
        );



    if (!account) {
        return (
            <div>No Data</div>
        );
    }

    const handleOnFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await followAccount(params.accountID as string);
    }

    return (
        <div className="flex-grow p-6 w-full max-w-2xl mx-auto rounded-2xl shadow-2xl space-y-6">
            {(errorAuth || errorPost) && <ErrorDisplay error={errorAuth || errorPost || undefined} />}

            {/* Profile Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden cursor-pointer">
                        <img
                            src={
                                account.avatar_url?.trim() || `https://ui-avatars.com/api/?name=${account.username}&background=00bcff&color=fff`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{account.username}</h2>
                        <p className="text-sm text-sky-300">Joined on {new Date(account.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <button
                    onClick={handleOnFollow}
                    className={`px-4 py-2 rounded-full font-semibold transition-transform duration-300 
            ${account.is_following ? "bg-slate-500 hover:bg-slate-400" : "bg-sky-600 hover:bg-sky-500"} 
            text-white hover:scale-[1.05]`}
                >
                    {account.is_following ? "Following" : "Follow"}
                </button>
            </div>

            {/* Bio */}
            <p className="text-sky-100">
                {account.bio || <span className="italic text-sky-300">No bio provided.</span>}
            </p>

            {/* Followers / Following */}
            <div className="flex justify-evenly text-center border-t border-b border-cyan-500 py-2">
                <div>
                    <div className="text-lg font-bold">{account.followers_count}</div>
                    <div className="text-sm text-sky-300 hover:underline cursor-pointer">Followers</div>
                </div>
                <div>
                    <div className="text-lg font-bold">{account.following_count}</div>
                    <div className="text-sm text-sky-300 hover:underline cursor-pointer">Following</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 p-2 space-x-4">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`bg-gradient-to-b ${selectedOption === option ? "border-b-4 border-sky-500" : ""} 
              cursor-pointer py-2 rounded hover:scale-[1.1] transform transition duration-300 text-white text-lg`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                {selectedOption === "Shared" && postsOfUser?.map((post, index) => (
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
    );
}

export default ProfilePage;