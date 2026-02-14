
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Export the proxy function as required by Next.js
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
