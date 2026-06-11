import MockupClient from './MockupClient';

export default function MockupPage() {
  // Proteção de rota via middleware NextAuth v5.
  return <MockupClient />;
}

export const metadata = {
  title: 'Mockup Studio · Nort Sports',
};
