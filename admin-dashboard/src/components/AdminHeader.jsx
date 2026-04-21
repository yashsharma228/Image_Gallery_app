import { motion } from 'framer-motion';
import { Search, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader({ user, search, setSearch }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          {/* Left Side: Logo (Mobile visible) */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Framely
            </span>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search gallery assets..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <img 
                  src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                  alt="profile" 
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" 
                />
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 overflow-hidden"
                >
                  <button className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <UserIcon size={18} />
                    <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                  <button className="w-full px-4 py-2.5 flex items-center gap-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
