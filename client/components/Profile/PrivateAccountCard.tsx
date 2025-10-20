"use client";
import React from "react";
import { PrivateAccount } from "@/schemas/account";
import { ShieldAlert } from "lucide-react";

interface Props {
  account: PrivateAccount;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const PrivateAccountCard: React.FC<Props> = ({ account, setIsEditing }) => {
  if (!account) return null;

  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={
              account.avatar_url?.trim()
                ? account.avatar_url
                : `https://ui-avatars.com/api/?name=${account.username}&background=00bcff&color=fff`
            }
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">{account.username}</h1>
          <p className="flex items-center gap-2 text-sm text-cyan-200">
            {account.email}{" "}
            {account.is_verified ? (
              <span className="text-green-400 font-semibold">Verified</span>
            ) : (
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
            )}
          </p>
          {account.full_name && (
            <p className="text-cyan-200">Full name: {account.full_name}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-transform duration-300"
          >
            Edit
          </button>
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-cyan-200">
        <div className="col-span-2">
          <h2 className="font-semibold text-sm text-sky-400 mb-1">Bio</h2>
          <p className={account.bio ? "" : "italic text-sky-200"}>
            {account.bio || "No bio provided."}
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-sm text-sky-400 mb-1">Followers</h2>
          <p>{account.followers_count}</p>
        </div>
        <div>
          <h2 className="font-semibold text-sm text-sky-400 mb-1">Following</h2>
          <p>{account.following_count}</p>
        </div>
        <div>
          <h2 className="font-semibold text-sm text-sky-400 mb-1">Created At</h2>
          <p>{formatDate(account.created_at)}</p>
        </div>
        <div>
          <h2 className="font-semibold text-sm text-sky-400 mb-1">Last Updated</h2>
          <p>{formatDate(account.updated_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivateAccountCard;
