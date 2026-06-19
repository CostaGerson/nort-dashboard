import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const SALT = 'nort-trafego-2026';

function token(senha: string) {
  return createHash('sha256').update(senha + SALT).digest('hex');
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const senha = typeof body?.senha === 'string' ? body.senha : '';
  const correta = process.env.TRAFEGO_SENHA || '';

  if (!correta) {
    return NextResponse.json({ ok: false, error: 'nao_configurada' }, { status: 500 });
  }
  if (senha !== correta) {
    return NextResponse.json({ ok: false, error: 'senha_invalida' }, { status: 401 });
  }

  cookies().set('traf_ok', token(correta), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return NextResponse.json({ ok: true });
}
