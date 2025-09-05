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
            {errorPost && (
                <ErrorDisplay error={errorAuth || errorPost || undefined} />
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-teal-300 overflow-hidden hover:cursor-pointer">
                        <img
                            src={
                                account.avatar_url ??
                                `https://ui-avatars.com/api/?name=${account.username}&background=00bba7`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{account.username}</h2>
                        <p className="text-sm text-teal-300">
                            Joined on {new Date(account.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div>
                    <button
                        onClick={(e) => handleOnFollow(e)}
                        className="bg-teal-600 text-white px-4 py-2 cursor-pointer rounded-full hover:scale-[1.05] hover:bg-teal-500 transition duration-300">
                        {account.is_following !== null && account.is_following ? (
                            <span>Following</span>
                        ) : (
                            <span>Follow</span>
                        )}
                    </button>
                </div>
            </div>

            <div>
                <p className="text-teal-100">
                    {account.bio || <span className="italic text-teal-400">No bio provided.</span>}
                </p>
            </div>

            <div className="flex justify-evenly text-center border-t border-b border-teal-700 py-2">
                <div>
                    <div className="text-lg font-bold">{account.followers_count}</div>
                    <div className="text-sm text-teal-300 hover:underline cursor-pointer">Followers</div>
                </div>
                <div>
                    <div className="text-lg font-bold">{account.following_count}</div>
                    <div className="text-sm text-teal-300 hover:underline cursor-pointer">Following</div>
                </div>
            </div>
            <div className="grid grid-cols-3 p-2 space-x-4">
                {options.map((option, index) => (
                    <button key={index}
                        onClick={() => setSelectedOption(option)}
                        className={`${selectedOption !== option ? "bg-gradient-to-b from-teal-600 to-teal-900" : "bg-gradient-to-b from-teal-900 to-teal-600"} cursor-pointer py-2
                    rounded hover:scale-[1.1] transform transition duration-300 text-white text-lg`}>
                        {option}
                    </button>
                ))}
            </div>
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
    );
}

export default ProfilePage;