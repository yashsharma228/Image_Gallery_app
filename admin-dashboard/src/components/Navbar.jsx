import React from "react";

function IconHome({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconPlusSquare({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
export default function Navbar() {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[0%] z-50 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm transition-colors rounded-xl">
      <div className="w-full px-4 py-3 flex justify-between items-center">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 tracking-tight select-none">
            Framely
          </span>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center">
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
        </div>

      </div>
    </header>
  );
}