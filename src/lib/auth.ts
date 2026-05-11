import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha',   type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = String(credentials.username).trim().toUpperCase();
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name || user.username,
          email: `${user.username.toLowerCase()}@nort.local`,
          role: user.role,
        } as any;
      },
    }),
  ],
});
