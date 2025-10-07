import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/sign-in',
  '/sign-up',
  '/',
  '/home',
]);

// Define public API routes
const isPublicApiRoute = createRouteMatcher([
  '/api/video',
]);

export default clerkMiddleware(async (auth, req) => {
  // Await the auth() call to get the userId
  const { userId } = await auth();

  const currentUrl = new URL(req.url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'); // Add base URL for relative

  const isAccessingDashboard = currentUrl.pathname === '/home';
  const isApiRequest = currentUrl.pathname.startsWith('/api');

  // If user not logged in and tries to access a protected route, redirect to sign-in
  if (!userId && !isPublicRoute(req) && !isPublicApiRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', currentUrl));
  }

  // If user not logged in and tries to access a protected API route, redirect to sign-in
  if (!userId && isApiRequest && !isPublicApiRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', currentUrl));
  }

  // If user is logged in and tries to access a public route (like sign-in or sign-up), redirect to /home
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL('/home', currentUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.).*)',
    '/(api|trpc)(.*)',
  ],
};