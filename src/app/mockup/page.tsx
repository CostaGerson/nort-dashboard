import MockupClient from './MockupClient';

export default function MockupPage() {
  // Proteção de rota: middleware do NextAuth v5 cuida do redirect pra /login.
  // Se o middleware ainda não protege essa rota, conferir matcher em src/middleware.ts.
  return <MockupClient />;
}

export const metadata = {
  title: 'Mockup Studio · Nort Sports',
};
