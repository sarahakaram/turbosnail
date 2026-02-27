import { cookies } from 'next/headers';
import { getDb } from './db';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'wg_session';
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  primary_species: string | null;
  secondary_species: string | null;
  chronotype: string;
  core_values: string[];
  weekly_priorities: string[];
  team_role: string;
  interview_complete: boolean;
  profile_complete: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = getDb();
  const session = db
    .prepare(
      `SELECT s.*, u.* FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`
    )
    .get(sessionId) as any;

  if (!session) return null;

  return {
    id: session.user_id,
    name: session.name,
    email: session.email,
    primary_species: session.primary_species,
    secondary_species: session.secondary_species,
    chronotype: session.chronotype,
    core_values: JSON.parse(session.core_values || '[]'),
    weekly_priorities: JSON.parse(session.weekly_priorities || '[]'),
    team_role: session.team_role,
    interview_complete: !!session.interview_complete,
    profile_complete: !!session.profile_complete,
  };
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    userId,
    expiresAt
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  });

  return sessionId;
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<{ user: SessionUser; error?: string }> {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return { user: null as any, error: 'An account with this email already exists' };
  }

  const id = uuid();
  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, name, email, passwordHash);

  await createSession(id);

  return {
    user: {
      id,
      name,
      email,
      primary_species: null,
      secondary_species: null,
      chronotype: 'mid',
      core_values: [],
      weekly_priorities: [],
      team_role: 'solo',
      interview_complete: false,
      profile_complete: false,
    },
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: SessionUser | null; error?: string }> {
  const db = getDb();

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!row) {
    return { user: null, error: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return { user: null, error: 'Invalid email or password' };
  }

  await createSession(row.id);

  return {
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      primary_species: row.primary_species,
      secondary_species: row.secondary_species,
      chronotype: row.chronotype,
      core_values: JSON.parse(row.core_values || '[]'),
      weekly_priorities: JSON.parse(row.weekly_priorities || '[]'),
      team_role: row.team_role,
      interview_complete: !!row.interview_complete,
      profile_complete: !!row.profile_complete,
    },
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    cookieStore.delete(SESSION_COOKIE);
  }
}
