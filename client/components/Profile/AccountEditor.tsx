"use client";
import { PrivateAccount } from '@/schemas/account';
import React, { useState } from 'react';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Upload, X } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

/* <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
<div className="rounded-lg shadow-lg p-6 max-w-xl text-center text-2xl font-semibold text-slate-900 flex items-center space-x-4"></div> */

interface Props {
    account: PrivateAccount;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
}

interface AccountEditForm {
    username: string;
    full_name: string;
    bio: string;
    avatar_url: string;
}

// shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-slate-500

const AccountEditor: React.FC<Props> = ({ account, setIsEditing }) => {
    const { updateProfile, error } = useAuth();
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [accountForm, setAccountForm] = useState<AccountEditForm>({
        username: account?.username || "",
        full_name: account?.full_name || "",
        bio: account?.bio || "",
        avatar_url: account?.avatar_url || "",
    });

    if (!account)
        return null;

    const handleOnValueChange = (key: string, value: string) => {
        setAccountForm((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const onSaveChanges = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // TO DO: add validation
        const result = await updateProfile(accountForm.full_name, accountForm.bio, accountForm.avatar_url);
        setIsEditing(!result);
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 w-full p-4">
            <div className="rounded-xl shadow-2xl bg-gradient-to-t from-slate-500 to-slate-700 text-slate-950 max-w-2xl w-full mx-auto flex flex-col space-y-4 p-6">
                <h1 className="text-2xl font-bold text-center text-white border-b-4 pb-2 border-slate-900 select-none">
                    Edit Your Account
                </h1>
                <p className='text-center text-slate-300 text-sm'>Upload profile avatar currently unavailable</p>
                {/* Avatar Upload */}
                <div className="rounded-xl shadow-xl p-4 bg-white flex flex-col items-center space-y-3">
                    
                    <label className="font-semibold text-gray-700">Profile Avatar</label>
                    <div className="relative">
                        <img
                            src={
                                preview ? 
                                preview : account.avatar_url && account.avatar_url.trim() !== "" ? account.avatar_url :
                                `https://ui-avatars.com/api/?name=${account.username}&background=50C878`

                            }
                            alt="Avatar"
                            className="w-28 h-28 rounded-full object-cover shadow-md border border-gray-200"
                        />
                        {preview && file && (
                            <button
                                onClick={() => {
                                    setPreview(null);
                                    setFile(null);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Hidden input */}
                    <input
                        type="file"
                        accept="image/*"
                        id="fileInput"
                        className="hidden"
                        onChange={onImageSelected}
                    />

                    {/* Buttons */}
                    <div className="flex space-x-2">
                        <label
                            htmlFor="fileInput"
                            className="flex cursor-pointer items-center space-x-2 rounded-lg border border-dashed border-gray-400 px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                        >
                            <Upload className="h-4 w-4" />
                            <span>Choose</span>
                        </label>
                        {file && (
                            <button
                                // onClick={uploadToServer}
                                // disabled={loading}
                                className="rounded-lg bg-slate-500 px-4 py-2 text-white shadow hover:bg-slate-600 disabled:opacity-50"
                            >
                                {"Upload"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Full Name */}
                <div className="rounded-xl shadow-xl p-2 bg-white">
                    <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                    <input
                        type="text"
                        className="block w-full px-4 py-2 bg-slate-50 rounded shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-500 hover:scale-[1.01] transition-all duration-300"
                        value={accountForm.full_name}
                        onChange={(e) => handleOnValueChange("full_name", e.target.value)}
                    />
                </div>

                {/* Biography */}
                <div className="rounded-xl shadow-xl p-2 bg-white">
                    <label className="font-semibold text-gray-700 block mb-1">
                        Biography <span className="italic text-sm">(max 500 characters)</span>
                    </label>
                    <textarea
                        maxLength={500}
                        className="block w-full h-32 px-4 py-2 bg-slate-50 rounded shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 hover:scale-[1.01] transition-all duration-300"
                        value={accountForm.bio}
                        onChange={(e) => handleOnValueChange("bio", e.target.value)}
                    />
                </div>

                {/* Error */}
                {error && <ErrorDisplay error={error} />}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 py-4">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gradient-to-b from-amber-500 to-amber-600 rounded py-2 text-white font-semibold hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSaveChanges}
                        className="bg-gradient-to-b from-lime-500 to-lime-600 rounded py-2 text-white font-semibold hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountEditor;