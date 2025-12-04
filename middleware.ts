import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/admin/login', '/discovery'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes and discovery survey pages
  if (isPublicRoute || pathname.startsWith('/discovery/')) {
    return res;
  }

  // Protected routes: /portal/* and /admin/*
  const isPortalRoute = pathname.startsWith('/portal');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isPortalRoute || isAdminRoute) {
    // No session - redirect to appropriate login
    if (!session) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role || 'client';

    // Admin route but user is not admin
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/portal', req.url));
    }

    // Portal route but user is admin - let them through (admins can view portal)
    // Or portal route and user is client - let them through
  }

  return res;
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
};
