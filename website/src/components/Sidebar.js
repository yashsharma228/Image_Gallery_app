"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Photos', href: '/', icon: '🖼️' },
  { name: 'Albums', href: '/albums', icon: '📁' },
  { name: 'My Likes', href: '/liked', icon: '❤️' },
  { name: 'Analytics', href: '/analytics', icon: '📊' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar({ active }) {
  const router = useRouter();
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-8 px-4 gap-2 sticky top-0">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-200 transition group
              ${active === item.href ? 'bg-indigo-50 dark:bg-slate-800 border-l-4 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
