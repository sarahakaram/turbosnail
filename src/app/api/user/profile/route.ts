import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = getDb();

  const allowedFields: Record<string, string> = {
    primary_species: 'primary_species',
    secondary_species: 'secondary_species',
    chronotype: 'chronotype',
    core_values: 'core_values',
    weekly_priorities: 'weekly_priorities',
    team_role: 'team_role',
    profile_complete: 'profile_complete',
    name: 'name',
  };

  const updates: string[] = [];
  const values: any[] = [];

  for (const [key, col] of Object.entries(allowedFields)) {
    if (body[key] !== undefined) {
      updates.push(`${col} = ?`);
      if (key === 'core_values' || key === 'weekly_priorities') {
        values.push(JSON.stringify(body[key]));
      } else if (key === 'profile_complete') {
        values.push(body[key] ? 1 : 0);
      } else {
        values.push(body[key]);
      }
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  // Return updated user
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      primary_species: updated.primary_species,
      secondary_species: updated.secondary_species,
      chronotype: updated.chronotype,
      core_values: JSON.parse(updated.core_values || '[]'),
      weekly_priorities: JSON.parse(updated.weekly_priorities || '[]'),
      team_role: updated.team_role,
      interview_complete: !!updated.interview_complete,
      profile_complete: !!updated.profile_complete,
    },
  });
}
