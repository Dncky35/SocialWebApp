"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NavBar: React.FC = () => {
  const { account, logout } = useAuth();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownVisible(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-2 bg-slate-950/50 backdrop-blur-sm">
      <div></div>
      
      {/* Logo */}
      <Link
        href="/"
        className="w-12 h-12 flex items-center justify-center text-2xl rounded-full bg-gradient-to-b from-cyan-500 to-sky-600 hover:from-sky-600 hover:to-cyan-500 transition-all duration-300"
      >
        🐤
      </Link>

      {/* User Avatar */}
      {account && (
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setDropdownVisible((prev) => !prev)}
            className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-slate-400"
          >
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

          {/* Dropdown */}
          {isDropdownVisible && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg overflow-hidden">
              <Link
                href="/profile/me"
                className="block px-4 py-2 text-gray-800 hover:bg-slate-100 transition"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-slate-100 transition"
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
