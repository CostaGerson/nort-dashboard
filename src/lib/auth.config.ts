import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  providers: [], // providers reais ficam em auth.ts (Node runtime)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).username = (user as any).name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname === '/login' ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico';
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
