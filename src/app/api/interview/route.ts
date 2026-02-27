import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { conductInterview } from '@/lib/claude';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const messages = db
    .prepare('SELECT role, content FROM interview_messages WHERE user_id = ? ORDER BY id')
    .all(user.id) as { role: string; content: string }[];

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  const db = getDb();

  // Get existing messages
  const existing = db
    .prepare('SELECT role, content FROM interview_messages WHERE user_id = ? ORDER BY id')
    .all(user.id) as { role: string; content: string }[];

  // If no messages yet and no user message, start the interview
  const messages: { role: 'user' | 'assistant'; content: string }[] = existing.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  if (message) {
    messages.push({ role: 'user', content: message });
    db.prepare('INSERT INTO interview_messages (user_id, role, content) VALUES (?, ?, ?)').run(
      user.id,
      'user',
      message
    );
  }

  // If starting fresh, send an initial greeting prompt
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content:
        "Hi, I'd like to discover my Wild Growth species. I'm ready to start the interview.",
    });
    db.prepare('INSERT INTO interview_messages (user_id, role, content) VALUES (?, ?, ?)').run(
      user.id,
      'user',
      "Hi, I'd like to discover my Wild Growth species. I'm ready to start the interview."
    );
  }

  const reply = await conductInterview(messages);

  db.prepare('INSERT INTO interview_messages (user_id, role, content) VALUES (?, ?, ?)').run(
    user.id,
    'assistant',
    reply
  );

  // Check if interview is complete (contains JSON result)
  let result = null;
  const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      result = JSON.parse(jsonMatch[1]);
      if (result.status === 'complete') {
        db.prepare(
          'UPDATE users SET interview_complete = 1 WHERE id = ?'
        ).run(user.id);
      }
    } catch {
      result = null;
    }
  }

  return NextResponse.json({ reply, result });
}
