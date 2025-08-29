import React from 'react';
import { PrivateAccount } from '@/schemas/account';

interface Props {
    account: PrivateAccount;
};

const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
});

const PrivateAccountCard:React.FC<Props> = ({account}) => {

    if(!account)
        return null;

    return (
        <div className="bg-gradient-to-t from-emerald-50 to-emerald-200 shadow-lg rounded-lg p-8">
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
                <div className="col-span-2">
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
                    <h2 className="font-semibold text-sm text-emerald-500 mb-1">Created At</h2>
                    <p>{formatDate(account.created_at)}</p>
                </div>
                <div>
                    <h2 className="font-semibold text-sm text-emerald-500 mb-1">Last Updated</h2>
                    <p>{formatDate(account.updated_at)}</p>
                </div>
            </div>
        </div>
    );
};

export default PrivateAccountCard;