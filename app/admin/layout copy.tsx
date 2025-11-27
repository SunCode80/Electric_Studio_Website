/**
 * Admin Layout - /app/admin/layout.tsx
 * 
 * Wrapper layout for all admin pages.
 * Can be extended for authentication, navigation, etc.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Electric Studio',
  description: 'Electric Studio Administrative Tools',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
