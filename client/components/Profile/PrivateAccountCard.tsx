"use client";
import React from 'react';
import { PrivateAccount } from '@/schemas/account';
import { ShieldAlert } from "lucide-react";

interface Props {
    account: PrivateAccount;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const PrivateAccountCard: React.FC<Props> = ({ account, setIsEditing }) => {

    if (!account)
        return null;

    return (
        <div className="bg-gradient-to-t from-slate-50 to-slate-200 shadow-lg rounded-lg p-8">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-32 rounded-full bg-slate-300 overflow-hidden">
                    <img
                       src={
                            (account.avatar_url && account.avatar_url.trim() !== "") ? account.avatar_url : 
                            `https://ui-avatars.com/api/?name=${account.username}&background=cad5e2`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <h1 className='text-3xl font-bold text-slate-800'>{account.username}</h1>
                    <p className='text-slate-600 text-sm mt-1 flex items-center gap-x-2'>{account.email} <span>{account.is_verified ? 'Verified' : <ShieldAlert />}</span></p>
                    {account.full_name && (
                        <p className='text-slate-500 mt-1'>Full name: {account.full_name}</p>
                    )}
                </div>
                <div className='flex justify-end items-start'>
                    <button
                        onClick={() => setIsEditing(true)}
                        className='bg-slate-900 rounded py-2 px-6 text-white hover:bg-slate-800 cursor-pointer hover:scale-[1.1] transition-all duration-300'>
                        Edit
                    </button>
                </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-700">
                <div className="col-span-2">
                    <h2 className="font-semibold text-sm text-slate-500 mb-1">Bio</h2>
                    <p className={account.bio ? '' : 'italic text-slate-400'}>
                        {account.bio || 'No bio provided.'}
                    </p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-slate-500 mb-1">Followers</h2>
                    <p>{account.followers_count}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-slate-500 mb-1">Following</h2>
                    <p>{account.following_count}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-slate-500 mb-1">Created At</h2>
                    <p>{formatDate(account.created_at)}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-slate-500 mb-1">Last Updated</h2>
                    <p>{formatDate(account.updated_at)}</p>
                </div>
            </div>
        </div>
    );
};

export default PrivateAccountCard;