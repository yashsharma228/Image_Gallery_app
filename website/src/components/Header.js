'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MoonIcon, SunIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const Header = ({ user, onLogout, search, setSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    setIsDropdownOpen(false);
  };

  // Toggle dark mode (simple class on html)
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8">
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 tracking-tight flex items-center gap-2">
            Framely
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch && setSearch(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow focus:ring-2 focus:ring-indigo-400 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-800 transition group"
              >
                <Image
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full border border-indigo-200 dark:border-slate-700 shadow"
                />
                <span className="hidden md:inline text-slate-800 dark:text-slate-100 font-medium transition-all group-hover:text-indigo-600">{user.name}</span>
                <svg className="w-4 h-4 text-slate-400 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-300 break-words">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1 truncate">{user.name}</div>
                    <div className="break-words whitespace-pre-line max-w-full text-ellipsis overflow-hidden">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-slate-700 transition font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
