'use client';
import React from "react";
import { useParams } from "next/navigation";
import { usePostContext } from "@/context/PostContext";

const ProfilePage:React.FC = () => {
    const params = useParams();
    const { posts } = usePostContext();
    const account = posts.find((post) => post.owner.username === params.username)?.owner;

    if(!account){
        return(
            <div>No Data</div>
        );
    }

    return (
        <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl max-w-xl w-full mx-auto space-y-6">
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
            <p className="text-emerald-100">
            {account.bio || <span className="italic text-emerald-400">No bio provided.</span>}
            </p>
        </div>

        <div className="flex justify-between text-center border-t border-emerald-700 pt-4">
            <div>
            <div className="text-lg font-bold">{account.followers_count}</div>
            <div className="text-sm text-emerald-300">Followers</div>
            </div>
            <div>
            <div className="text-lg font-bold">{account.following_count}</div>
            <div className="text-sm text-emerald-300">Following</div>
            </div>
            <div>
            {account.is_following !== null && (
                <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-emerald-600 text-white">
                {account.is_following ? "Following" : "Not Following"}
                </span>
            )}
            </div>
        </div>
        </div>
    );
}

export default ProfilePage;