import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { analyzeTeamFriction, generateTeamRitual } from '@/lib/claude';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  // Get team the user leads or belongs to
  let team = db
    .prepare('SELECT * FROM teams WHERE leader_id = ?')
    .get(user.id) as any;

  if (!team) {
    const membership = db
      .prepare('SELECT team_id FROM team_members WHERE user_id = ?')
      .get(user.id) as any;
    if (membership) {
      team = db.prepare('SELECT * FROM teams WHERE id = ?').get(membership.team_id) as any;
    }
  }

  if (!team) {
    return NextResponse.json({ team: null, members: [] });
  }

  const members = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.primary_species, u.secondary_species
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?`
    )
    .all(team.id) as any[];

  const frictionAnalysis = team.friction_analysis ? JSON.parse(team.friction_analysis) : null;

  const rituals = db
    .prepare('SELECT * FROM team_rituals WHERE team_id = ? ORDER BY created_at DESC LIMIT 10')
    .all(team.id) as any[];

  return NextResponse.json({
    team: {
      id: team.id,
      name: team.name,
      leaderId: team.leader_id,
      frictionAnalysis,
      frictionUpdatedAt: team.friction_updated_at,
    },
    members,
    rituals: rituals.map((r: any) => ({
      ...r,
      content: JSON.parse(r.content),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const db = getDb();

  if (action === 'create') {
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Team name required' }, { status: 400 });

    const teamId = uuid();
    db.prepare('INSERT INTO teams (id, name, leader_id) VALUES (?, ?, ?)').run(
      teamId,
      name,
      user.id
    );
    db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)').run(teamId, user.id);

    return NextResponse.json({ teamId });
  }

  if (action === 'add_member') {
    const { email } = body;
    const team = db.prepare('SELECT * FROM teams WHERE leader_id = ?').get(user.id) as any;
    if (!team) return NextResponse.json({ error: 'You must create a team first' }, { status: 400 });

    const member = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (!member) {
      return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });
    }

    const existing = db
      .prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?')
      .get(team.id, member.id) as any;
    if (existing) {
      return NextResponse.json({ error: 'Already a team member' }, { status: 400 });
    }

    db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)').run(
      team.id,
      member.id
    );

    return NextResponse.json({ ok: true });
  }

  if (action === 'analyze_friction') {
    const team = db.prepare('SELECT * FROM teams WHERE leader_id = ?').get(user.id) as any;
    if (!team) return NextResponse.json({ error: 'No team found' }, { status: 400 });

    const members = db
      .prepare(
        `SELECT u.primary_species FROM team_members tm
         JOIN users u ON tm.user_id = u.id
         WHERE tm.team_id = ? AND u.primary_species IS NOT NULL`
      )
      .all(team.id) as any[];

    if (members.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 members with species to analyze' },
        { status: 400 }
      );
    }

    const analysis = await analyzeTeamFriction(
      user.primary_species || 'oak',
      members.map((m: any) => m.primary_species)
    );

    db.prepare(
      `UPDATE teams SET friction_analysis = ?, friction_updated_at = datetime('now') WHERE id = ?`
    ).run(JSON.stringify(analysis), team.id);

    return NextResponse.json({ analysis });
  }

  if (action === 'generate_ritual') {
    const { ritualType } = body;
    const team = db.prepare('SELECT * FROM teams WHERE leader_id = ?').get(user.id) as any;
    if (!team) return NextResponse.json({ error: 'No team found' }, { status: 400 });

    const members = db
      .prepare(
        `SELECT u.primary_species FROM team_members tm
         JOIN users u ON tm.user_id = u.id
         WHERE tm.team_id = ? AND u.primary_species IS NOT NULL`
      )
      .all(team.id) as any[];

    const ritual = await generateTeamRitual(
      ritualType,
      user.primary_species || 'oak',
      members.map((m: any) => m.primary_species)
    );

    const ritualId = uuid();
    db.prepare(
      'INSERT INTO team_rituals (id, team_id, ritual_type, content) VALUES (?, ?, ?, ?)'
    ).run(ritualId, team.id, ritualType, JSON.stringify(ritual));

    return NextResponse.json({ ritual, ritualId });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
