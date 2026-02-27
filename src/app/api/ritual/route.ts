import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb, todayDate } from '@/lib/db';
import { generateRitual, generateEveningReflection } from '@/lib/claude';
import { getSpecies } from '@/lib/species';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const today = todayDate();
  const entry = db
    .prepare('SELECT * FROM daily_entries WHERE user_id = ? AND date = ?')
    .get(user.id, today) as any;

  return NextResponse.json({ entry: entry || null });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const db = getDb();
  const today = todayDate();

  if (action === 'morning') {
    const { energyLevel, notes } = body;
    const species = getSpecies(user.primary_species || 'oak');
    if (!species) return NextResponse.json({ error: 'Species not set' }, { status: 400 });

    const secondarySpecies = user.secondary_species ? getSpecies(user.secondary_species) : null;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[new Date().getDay()];

    // Get team species if applicable
    let teamSpecies: string[] = [];
    const membership = db
      .prepare('SELECT team_id FROM team_members WHERE user_id = ?')
      .get(user.id) as any;
    if (membership) {
      const members = db
        .prepare(
          `SELECT u.primary_species FROM team_members tm
           JOIN users u ON tm.user_id = u.id
           WHERE tm.team_id = ? AND u.primary_species IS NOT NULL`
        )
        .all(membership.team_id) as any[];
      teamSpecies = members.map((m: any) => m.primary_species);
    }

    // Get previous evening data
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const prevEntry = db
      .prepare('SELECT tomorrow_priority FROM daily_entries WHERE user_id = ? AND date = ?')
      .get(user.id, yesterdayStr) as any;

    const ritual = await generateRitual({
      species: species.slug,
      secondarySpecies: secondarySpecies?.slug || null,
      learningStyle: species.learningStyle,
      primaryDriver: species.primaryDriver,
      secondaryDriver: species.secondaryDriver,
      chronotype: user.chronotype,
      energyLevel,
      priorities: user.weekly_priorities,
      teamSpecies: teamSpecies.length > 0 ? teamSpecies : undefined,
      dayOfWeek,
      previousEvening: prevEntry?.tomorrow_priority || undefined,
    });

    // Upsert daily entry
    const existing = db
      .prepare('SELECT id FROM daily_entries WHERE user_id = ? AND date = ?')
      .get(user.id, today) as any;

    if (existing) {
      db.prepare(
        `UPDATE daily_entries SET
         morning_energy = ?, morning_notes = ?,
         generated_schedule = ?, generated_nudge = ?,
         generated_derailer = ?, generated_intention = ?,
         updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        energyLevel,
        notes || '',
        JSON.stringify(ritual.time_blocks || []),
        ritual.coaching_nudge || '',
        ritual.derailer_watch || '',
        ritual.morning_intention_prompt || '',
        existing.id
      );
    } else {
      db.prepare(
        `INSERT INTO daily_entries (id, user_id, date, morning_energy, morning_notes,
         generated_schedule, generated_nudge, generated_derailer, generated_intention)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        uuid(),
        user.id,
        today,
        energyLevel,
        notes || '',
        JSON.stringify(ritual.time_blocks || []),
        ritual.coaching_nudge || '',
        ritual.derailer_watch || '',
        ritual.morning_intention_prompt || ''
      );
    }

    return NextResponse.json({ ritual });
  }

  if (action === 'evening_generate') {
    const species = getSpecies(user.primary_species || 'oak');
    if (!species) return NextResponse.json({ error: 'Species not set' }, { status: 400 });

    const entry = db
      .prepare('SELECT * FROM daily_entries WHERE user_id = ? AND date = ?')
      .get(user.id, today) as any;

    const reflection = await generateEveningReflection({
      species: species.slug,
      learningStyle: species.learningStyle,
      primaryDriver: species.primaryDriver,
      energyMorning: entry?.morning_energy || 3,
      priorities: user.weekly_priorities,
      wins: entry?.wins || undefined,
      drains: entry?.drains || undefined,
    });

    // Store reflection
    if (entry) {
      db.prepare(
        `UPDATE daily_entries SET
         evening_reflections = ?, evening_closing = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        JSON.stringify(reflection.reflection_questions || []),
        reflection.closing_note || '',
        entry.id
      );
    }

    return NextResponse.json({ reflection });
  }

  if (action === 'evening_save') {
    const { eveningEnergy, wins, drains, tomorrowPriority } = body;
    const entry = db
      .prepare('SELECT id FROM daily_entries WHERE user_id = ? AND date = ?')
      .get(user.id, today) as any;

    if (entry) {
      db.prepare(
        `UPDATE daily_entries SET
         evening_energy = ?, wins = ?, drains = ?, tomorrow_priority = ?,
         updated_at = datetime('now')
         WHERE id = ?`
      ).run(eveningEnergy || null, wins || '', drains || '', tomorrowPriority || '', entry.id);
    } else {
      db.prepare(
        `INSERT INTO daily_entries (id, user_id, date, evening_energy, wins, drains, tomorrow_priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(uuid(), user.id, today, eveningEnergy || null, wins || '', drains || '', tomorrowPriority || '');
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
