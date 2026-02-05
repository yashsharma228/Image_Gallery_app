'use client';

import Link from 'next/link';
import { useState } from 'react';

const Header = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          🖼️ Image Gallery
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-gray-200 transition font-semibold">
            Gallery
          </Link>
          
          {user && (
            <Link href="/liked" className="hover:text-gray-200 transition font-semibold">
              ❤️ My Likes
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition"
              >
                {user.name} ▼
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg">
                  <div className="p-4 border-b text-sm text-gray-600">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
