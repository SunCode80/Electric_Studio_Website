'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  Home,
  MessageSquare,
  Folder,
  Briefcase,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  user: any;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/portal', icon: Home },
    { name: 'Messages', href: '/portal/messages', icon: MessageSquare },
    { name: 'Files', href: '/portal/files', icon: Folder },
    { name: 'Projects', href: '/portal/projects', icon: Briefcase },
    { name: 'Meetings', href: '/portal/meetings', icon: Calendar },
    { name: 'Settings', href: '/portal/settings', icon: Settings },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-purple-800">
        <Image
          src="/ELEC_Logo_Silver.png"
          alt="Electric Studio"
          width={180}
          height={60}
          className="h-10 w-auto brightness-200 mb-2"
        />
        <p className="text-purple-300 text-sm">Client Portal</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-purple-800">
        <div className="mb-3">
          <p className="text-sm text-purple-300">Signed in as</p>
          <p className="text-white font-medium truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 bg-purple-800/50 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
