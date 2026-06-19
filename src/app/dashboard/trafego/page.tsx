import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import TrafegoClient from './TrafegoClient';
import TrafegoGate from './TrafegoGate';

export const metadata = {
  title: 'Tráfego Pago — Nort Dashboard',
};

const SALT = 'nort-trafego-2026';

function token(senha: string) {
  return createHash('sha256').update(senha + SALT).digest('hex');
}

export default function TrafegoPage() {
  const senha = process.env.TRAFEGO_SENHA || '';
  const esperado = senha ? token(senha) : '';
  const atual = cookies().get('traf_ok')?.value;
  const liberado = !!esperado && atual === esperado;

  if (!liberado) {
    return <TrafegoGate />;
  }

  return <TrafegoClient />;
}
