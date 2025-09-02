'use client';
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePostContext } from "@/context/PostContext";
import PostCard from "@/components/Posts/PostCard";
import { useAuth } from "@/context/AuthContext";
import LoadingComponent from "@/components/Loading";

const ProfilePage:React.FC = () => {
    const params = useParams();
    const { isLoading, pageState, error:errorAuth} = useAuth();
    const { isLoading:isLoadingPost, fetchAccountWithId, posts, followAccount, error:errorPost } = usePostContext();
    
    const account = posts?.find((post) => post.owner.id === params.accountID)?.owner || null;
    const postsOfUser = posts?.filter((post) => post.owner.id === params.accountID) || null;

    useEffect(() => {
        if(isLoading || errorAuth || errorPost || isLoadingPost)
            return;

        if(account === null){
            const fetchAccount = async () =>  await fetchAccountWithId(params.accountID as string);
            fetchAccount();
        }

    }, [account, errorPost, errorAuth]);

    if(isLoading || isLoadingPost || pageState === "Initializing" || !posts || !account)
        return(
            <div>
                <LoadingComponent />
            </div>
        );

    if(!account){
        return(
            <div>No Data</div>
        );
    }

    const handleOnFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await followAccount(params.accountID as string);
    }

    return (
        <div className="flex-grow p-6 w-full max-w-2xl mx-auto rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-300 overflow-hidden hover:cursor-pointer">
                        <img
                            src={
                                account.avatar_url ??
                                `https://ui-avatars.com/api/?name=${account.username}&background=50C878`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{account.username}</h2>
                        <p className="text-sm text-emerald-300">
                            Joined on {new Date(account.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div>
                    <button 
                    onClick={(e) => handleOnFollow(e)}
                    className="bg-emerald-600 text-white px-4 py-2 cursor-pointer rounded-full hover:bg-emerald-700 transition duration-300">
                        {account.is_following !== null && account.is_following ? (
                            <span>Following</span>
                        ) : (
                            <span>Follow</span>
                        )}
                    </button>
                </div>
            </div>

            <div>
                <p className="text-emerald-100">
                {account.bio || <span className="italic text-emerald-400">No bio provided.</span>}
                </p>
            </div>

            <div className="flex justify-evenly text-center border-t border-b border-emerald-700 py-2">
                <div>
                <div className="text-lg font-bold">{account.followers_count}</div>
                <div className="text-sm text-emerald-300">Followers</div>
                </div>
                <div>
                <div className="text-lg font-bold">{account.following_count}</div>
                <div className="text-sm text-emerald-300">Following</div>
                </div>
            </div>
            {postsOfUser?.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

export default ProfilePage;