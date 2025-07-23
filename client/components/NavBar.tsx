"use client";
import Link from "next/link";
import React, { use, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NavBar: React.FC = () => {
    const { account, logout} = useAuth();
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const handleOnLogout = async () => {
        await logout();
        setDropdownVisible(false);
    }

    return (
        <nav className="bg-emerald-950 py-2 px-4 flex items-center justify-between ">
            <div className="bg-emerald-900 cursor-pointer rounded px-2 py-1 hover:bg-emerald-800 hover:text-white transition duration-200">
                <Link href={"/"}>Social Web 🚀</Link>
            </div>
           {account && (
                <div
                    className="relative"
                    onClick={() => setDropdownVisible((prev) => !prev)}
                    >
                    <div className="w-12 h-12 rounded-full bg-emerald-300 overflow-hidden hover:cursor-pointer">
                        <img
                            src={
                                account.avatar_url ??
                                `https://ui-avatars.com/api/?name=${account.username}&background=50C878`
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
                                className="block px-4 py-2 text-gray-800 hover:bg-emerald-100"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleOnLogout}
                                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-emerald-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;
