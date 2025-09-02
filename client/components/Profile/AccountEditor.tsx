"use client";
import { PrivateAccount } from '@/schemas/account';
import React, { useState } from 'react';
import { usePostContext } from '@/context/PostContext';

/* <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
<div className="rounded-lg shadow-lg p-6 max-w-xl text-center text-2xl font-semibold text-emerald-900 flex items-center space-x-4"></div> */

interface Props{
    account:PrivateAccount;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
}

interface AccountEditForm{
    username:string;
    full_name:string;
    bio:string;
    avatar_url: string;
}

// shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500

const AccountEditor:React.FC<Props> = ({ account, setIsEditing }) => {
    const { updateProfile, isLoading, error } = usePostContext();
    if(!account)
        return null;

    const [accountForm, setAccountForm] = useState<AccountEditForm>({
        username: account.username,
        full_name: account.full_name || "",
        bio: account.bio || "",
        avatar_url: account.avatar_url || "",
    });

    const handleOnValueChange = ( key:string, value:string ) => {
        setAccountForm((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if(!file)
            return;
        console.log(file);
    };

    const onSaveChanges = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // TO DO: add validation
        const result = await updateProfile(accountForm.full_name, accountForm.bio, accountForm.avatar_url);

        if(result)
            setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 w-full">
            <div className="rounded-lg shadow-lg bg-gradient-to-t from-emerald-500 to-emerald-700 text-emerald-950 p-4 max-w-2xl w-full mx-auto flex flex-col space-y-2">
                <h1 className='text-2xl font-semibold text-center text-white border-b-4 pb-2 border-emerald-900 cursor-default'>Edit Your Account</h1>
                {/* <div className='rounded-xl shadow-xl p-2'>
                    <label htmlFor="username" className="ml-1 font-semibold block text-md py-1" >Username</label>
                    <input
                    id='username' 
                    type="text"
                    className='block px-4 py-2 w-full bg-emerald-50 rounded hover:scale-[1.01] transition-all duration-300'
                    defaultValue={accountForm.username} onChange={(e) => handleOnValueChange("username", e.target.value)} />
                </div> */}
                <div className='rounded-xl shadow-xl p-2'>
                    <label htmlFor="avatar_url" className="ml-1 font-semibold block text-md py-1 text-emerald-50" >
                        Profile Avatar
                    </label>
                    <div className='flex space-x-4 items-center justify-center'>
                    <img
                        src={
                            account.avatar_url ??
                            `https://ui-avatars.com/api/?name=${account.username}&background=50C878`
                        }
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                        />
                    <input
                    id='avatar_url' 
                    type={"file"}
                    accept="image/*"
                    className="block w-full text-sm text-emerald-900 bg-emerald-50 rounded-lg cursor-pointer 
                    file:m-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white hover:file:bg-emerald-600 file:cursor-pointer"
                    value={accountForm.avatar_url} onChange={(e) => onImageSelected(e)} />

                    </div>
                    
                </div>
                <div className='rounded-xl shadow-xl p-2'>
                    <label htmlFor="full_name" className="ml-1 font-semibold block text-md py-1 text-emerald-50" >Full Name</label>
                    <input
                    id='full_name' 
                    type="text"
                    className='block px-4 py-2 w-full bg-emerald-50 rounded hover:scale-[1.01] transition-all duration-300'
                    value={accountForm.full_name} onChange={(e) => handleOnValueChange("full_name", e.target.value)} />
                </div>
                <div className='rounded-xl shadow-xl p-2'>
                    <label htmlFor="bio" className="ml-1 font-semibold block text-md py-1 text-emerald-50" >
                        Biography<span className='italic text-sm'>(max 500 characters)</span>
                    </label>
                    <textarea
                    id='bio' 
                    maxLength={500}
                    className='block px-4 py-2 w-full bg-emerald-50 rounded border hover:scale-[1.01] transition-all duration-300'
                    value={accountForm.bio} onChange={(e) => handleOnValueChange("bio", e.target.value)} />
                </div>
                {error && (
                    <div>
                        <p className='text-emerald-50 text-center font-semibold text-xl'>{error.detail || "Unknown error occured!"}</p>
                    </div>
                )}
                <div className='grid grid-cols-2 gap-4 py-4 text-white text-xl font-semibold'>
                    <button 
                    type={"button"}
                    onClick={() => setIsEditing(false)}
                    className='bg-gradient-to-b from-yellow-500 to-yellow-600 rounded py-2 hover:cursor-pointer hover:bg-gradient-to-t hover:scale-[1.01] transition-all duration-300'>
                        Cancel
                    </button>
                    <button 
                    type={"button"}
                    onClick={(e) => onSaveChanges(e)}
                    className='bg-gradient-to-b from-lime-500 to-lime-600 rounded py-2 hover:cursor-pointer 
                    hover:bg-gradient-to-t hover:scale-[1.01] transition-all duration-300'>
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
};

export default AccountEditor;