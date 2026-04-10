import { Inter } from 'next/font/google';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Framely – Discover & Share Moments',
  description: 'Framely is a beautiful image sharing app. Browse, like, and collect your favorite moments in a modern gallery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-gray-50 dark:bg-slate-900">
      <body className={inter.className + ' min-h-screen bg-gray-50 dark:bg-slate-900'}>
        {children}
      </body>
    </html>
  );
}
