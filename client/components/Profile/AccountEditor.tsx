"use client";
import React, { useState } from "react";
import { PrivateAccount } from "@/schemas/account";
import { useAuth } from "@/context/AuthContext";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Upload, X } from "lucide-react";

interface Props {
  account: PrivateAccount;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AccountEditForm {
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
}

const AccountEditor: React.FC<Props> = ({ account, setIsEditing }) => {
  const { updateProfile, error } = useAuth();

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [accountForm, setAccountForm] = useState<AccountEditForm>({
    username: account.username || "",
    full_name: account.full_name || "",
    bio: account.bio || "",
    avatar_url: account.avatar_url || "",
  });

  if (!account) return null;

  const handleOnValueChange = (key: string, value: string) =>
    setAccountForm((prev) => ({ ...prev, [key]: value }));

  const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const onSaveChanges = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const result = await updateProfile(accountForm.full_name, accountForm.bio, accountForm.avatar_url);
    setIsEditing(!result);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-gradient-to-t from-slate-700 to-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col space-y-6">
        <h1 className="text-center text-2xl font-bold text-white border-b border-slate-800 pb-2 select-none">
          Edit Your Account
        </h1>

        {/* Avatar */}
        <div className="flex flex-col items-center bg-slate-800 rounded-xl p-4 space-y-3">
          <label className="font-semibold text-slate-200">Profile Avatar</label>
          <div className="relative">
            <img
              src={
                preview
                  ? preview
                  : account.avatar_url?.trim()
                  ? account.avatar_url
                  : `https://ui-avatars.com/api/?name=${account.username}&background=00bcff&color=fff`
              }
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border border-slate-600 shadow-md"
            />
            {preview && file && (
              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <label
              htmlFor="fileInput"
              className="flex items-center space-x-2 px-4 py-2 border border-dashed border-slate-400 rounded-lg cursor-pointer text-slate-200 hover:bg-slate-700 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Choose</span>
            </label>
            {file && (
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg shadow transition">
                Upload
              </button>
            )}
          </div>
          <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
        </div>

        {/* Full Name */}
        <div className="flex flex-col bg-slate-800 rounded-xl p-3">
          <label className="font-semibold text-slate-200 mb-1">Full Name</label>
          <input
            type="text"
            value={accountForm.full_name}
            onChange={(e) => handleOnValueChange("full_name", e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col bg-slate-800 rounded-xl p-3">
          <label className="font-semibold text-slate-200 mb-1">
            Biography <span className="italic text-sm">(max 500 chars)</span>
          </label>
          <textarea
            maxLength={500}
            value={accountForm.bio}
            onChange={(e) => handleOnValueChange("bio", e.target.value)}
            className="w-full h-32 px-4 py-2 rounded-lg bg-slate-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Error */}
        {error && <ErrorDisplay error={error} />}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSaveChanges}
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-semibold transition-transform hover:scale-105"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountEditor;
