import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { user } = await req.json();

  console.log('Setting session cookie for user:', user);

  (await cookies()).set('session', JSON.stringify(user), {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return value;
    }
  }
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  const user = safeParse(sessionCookie.value);

  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ ok: true });
}
