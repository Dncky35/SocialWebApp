"use client";
import React from 'react';
import { PrivateAccount } from '@/schemas/account';

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
        <div className="bg-gradient-to-t from-teal-50 to-teal-200 shadow-lg rounded-lg p-8">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-32 rounded-full bg-teal-300 overflow-hidden">
                    <img
                        src={
                            account.avatar_url ??
                            `https://ui-avatars.com/api/?name=${account.username}&background=00bba7`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <h1 className='text-3xl font-bold text-teal-800'>{account.username}</h1>
                    <p className='text-teal-600 text-sm mt-1'>{account.email}</p>
                    <div className='flex items-center justify-start mt-1 space-x-2'>
                        <p className='bg-teal-600 rounded py-1 px-3 cursor-default'>{account.is_verified ? 'Verified' : 'Unverified'}</p>
                        {/* {!account.is_verified && (
                            <p className='text-teal-950 cursor-pointer underline hover:text-teal-800 font-semibold italic transform transition-all duration-300 hover:scale-[1.1]'>Lets Verify</p>
                        )} */}
                    </div>
                    {account.full_name && (
                        <p className='text-teal-500 mt-1'>Full name: {account.full_name}</p>
                    )}
                </div>
                <div className='flex justify-end items-start'>
                    <button
                        onClick={() => setIsEditing(true)}
                        className='bg-teal-900 rounded py-2 px-6 text-white hover:bg-teal-800 cursor-pointer hover:scale-[1.1] transition-all duration-300'>
                        Edit
                    </button>
                </div>
            </div>

            <hr className="my-6 border-teal-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-teal-700">
                <div className="col-span-2">
                    <h2 className="font-semibold text-sm text-teal-500 mb-1">Bio</h2>
                    <p className={account.bio ? '' : 'italic text-teal-400'}>
                        {account.bio || 'No bio provided.'}
                    </p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-teal-500 mb-1">Followers</h2>
                    <p>{account.followers_count}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-teal-500 mb-1">Following</h2>
                    <p>{account.following_count}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-teal-500 mb-1">Created At</h2>
                    <p>{formatDate(account.created_at)}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-teal-500 mb-1">Last Updated</h2>
                    <p>{formatDate(account.updated_at)}</p>
                </div>
            </div>
        </div>
    );
};

export default PrivateAccountCard;