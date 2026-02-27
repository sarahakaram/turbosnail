import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const { user, error } = await login(email, password);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json({ user });
}
