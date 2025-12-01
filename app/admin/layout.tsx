'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, FileText, ClipboardList } from 'lucide-react';
import { isAdminAuthenticated, logoutAdmin } from '@/lib/admin/auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/admin/login' && !isAdminAuthenticated()) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAdminAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="bg-dark-bg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-white">
                  Electric Studio Admin
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className="border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Projects
                </Link>
                <Link
                  href="/admin/submissions"
                  className="border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submissions
                </Link>
                <Link
                  href="/admin/discovery"
                  className="border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Discovery Surveys
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-electric-blue text-sm font-medium transition-colors"
              >
                Main Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-electric-blue text-sm font-medium inline-flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
