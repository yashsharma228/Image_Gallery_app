'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, LayoutDashboard, LogOut, User as UserIcon, Menu, X, Bell } from 'lucide-react';
import Image from 'next/image';

const Header = ({ user, onLogout, search, setSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    setIsDropdownOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-lg border-b border-slate-200 dark:border-slate-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <span className="text-white font-black text-xl">F</span>
            </motion.div>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tighter">
              Framely
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl">
            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all">
              <LayoutDashboard size={18} />
              <span>Explore</span>
            </Link>
            <Link href="/liked" className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-all">
              <Heart size={18} />
              <span>My Collection</span>
            </Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch && setSearch(e.target.value)}
                placeholder="Find something amazing..."
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block">
              <Bell size={20} />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition group border border-slate-100 dark:border-slate-800"
                >
                  <span className="hidden sm:inline text-sm font-bold text-slate-700 dark:text-slate-200">{user.name.split(' ')[0]}</span>
                  <Image
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {/* View Profile button removed */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                Get Started
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="relative group mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch && setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                />
              </div>
              <Link href="/" className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Explore</Link>
              <Link href="/liked" className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">My Collection</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
