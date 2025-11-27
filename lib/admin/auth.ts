import { supabase } from '@/lib/supabase/client';

export interface AdminSession {
  id: string;
  email: string;
  fullName: string;
  lastLoginAt: string;
}

const ADMIN_SESSION_KEY = 'admin_session';

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  try {
    const { data: admin, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Login error:', error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    if (!admin) {
      return { success: false, error: 'Invalid email or password' };
    }

    await supabase
      .from('admin_credentials')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const session: AdminSession = {
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      lastLoginAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, session };
  } catch (error) {
    return { success: false, error: 'An error occurred during login' };
  }
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionStr) return null;

  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
