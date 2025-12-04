'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, FileText, ClipboardList, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/admin/login');
        return;
      }

      // Check if user is admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData || profileData.role !== 'admin') {
        // Not admin, sign out and redirect
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/admin/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Show login page without layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!profile) {
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
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'border-electric-blue text-electric-blue'
                      : 'border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Projects
                </Link>
                <Link
                  href="/admin/submissions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/submissions'
                      ? 'border-electric-blue text-electric-blue'
                      : 'border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submissions
                </Link>
                <Link
                  href="/admin/discovery"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/discovery'
                      ? 'border-electric-blue text-electric-blue'
                      : 'border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Discovery
                </Link>
                <Link
                  href="/admin/clients"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/clients' || pathname.startsWith('/admin/clients/')
                      ? 'border-electric-blue text-electric-blue'
                      : 'border-transparent text-gray-400 hover:border-electric-blue hover:text-electric-blue'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Clients
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                {profile.full_name || profile.email}
              </span>
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
