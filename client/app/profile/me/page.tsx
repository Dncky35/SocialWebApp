"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import useRedirect from "@/hooks/useRedirect";

const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
});

const ProfilePage:React.FC = () => {
    useRedirect("home");
    const { account } = useAuth();

    if(!account)
        return null;

        return (
        <main className="bg-emerald-900 py-10 px-4 sm:px-8 rounded shadow-xl w-full">
            <div className="max-w-4xl mx-auto bg-emerald-50 shadow-lg rounded-lg p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-full bg-emerald-300 overflow-hidden">
                        <img
                            src={
                                account.avatar_url ??
                                `https://ui-avatars.com/api/?name=${account.username}&background=50C878`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-2">
                            {account.username}
                            {account.is_verified && (
                                <span className="text-emerald-500 text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                                    Verified
                                </span>
                            )}
                        </h1>
                        <p className="text-emerald-600 text-sm mt-1">{account.email}</p>
                        {account.full_name && (
                            <p className="text-emerald-500 mt-1">Full name: {account.full_name}</p>
                        )}
                    </div>
                </div>

                <hr className="my-6 border-emerald-200" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-emerald-700">
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Bio</h2>
                        <p className={account.bio ? '' : 'italic text-emerald-400'}>
                            {account.bio || 'No bio provided.'}
                        </p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Followers</h2>
                        <p>{account.followers_count}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Following</h2>
                        <p>{account.following_count}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Account ID</h2>
                        <p className="break-all">{account.id}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Created At</h2>
                        <p>{formatDate(account.created_at)}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Last Updated</h2>
                        <p>{formatDate(account.updated_at)}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-emerald-500 mb-1">Following This User?</h2>
                        <p>
                            {account.is_following === null
                                ? 'N/A'
                                : account.is_following
                                ? 'Yes'
                                : 'No'}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};


export default ProfilePage;