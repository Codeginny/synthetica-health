import { NextResponse, type NextRequest } from 'next/server';
import { API_URL, DEMO_CREDENTIALS, DEMO_MODE, SESSION_COOKIE } from '@/server/config';

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 8,
} as const;

/** Login: el JWT nunca llega al JS del navegador, queda en cookie httpOnly. */
export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as LoginBody;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  let token: string;
  let nombre: string;
  if (DEMO_MODE) {
    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    token = 'demo';
    nombre = 'Usuario demo';
  } else {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = (await res.json().catch(() => ({}))) as { token?: string; profesional?: { nombre: string }; error?: string };
    if (!res.ok || !body.token) {
      return NextResponse.json({ error: body.error ?? 'Credenciales inválidas' }, { status: res.status || 401 });
    }
    token = body.token;
    nombre = body.profesional?.nombre ?? email;
  }

  const res = NextResponse.json({ nombre });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
