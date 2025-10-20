"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NavBar: React.FC = () => {
    const { account, logout} = useAuth();
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const handleOnLogout = async () => {
        await logout();
        setDropdownVisible(false);
    }

    return (
        <nav className="z-50 fixed w-full top-0 bg-slate-950/50 py-2 px-8 flex items-center justify-between backdrop-blur-sm">
            <div></div>
            <div className="bg-gradient-to-b from-cyan-500 to-sky-600 cursor-pointer rounded flex items-center justify-center rounded-full 
            text-2xl w-12 h-12 hover:bg-gradient-to-t hover:text-white hover:scale-[1.01] transition duration-300">
                <Link href={"/"}>🐤</Link>
            </div>
           <div>
            {account && (
                <div
                    className="relative"
                    onClick={() => setDropdownVisible((prev) => !prev)}
                    >
                    <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden cursor-pointer">
                        <img
                            src={
                                (account.avatar_url && account.avatar_url.trim() !== "") ? account.avatar_url : 
                                `https://ui-avatars.com/api/?name=${account.username}&background=00bcff`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Dropdown */}
                    {isDropdownVisible && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded shadow-lg z-50">
                            <Link
                                href="/profile/me"
                                className="block px-4 py-2 text-gray-800 hover:bg-slate-100"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleOnLogout}
                                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-slate-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
           </div>
        </nav>
    );
};

export default NavBar;
