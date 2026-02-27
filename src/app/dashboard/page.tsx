'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { getSpecies, SPECIES } from '@/lib/species';
import type { Species } from '@/lib/species';

interface DailyEntry {
  morning_energy: number | null;
  morning_notes: string;
  generated_schedule: string;
  generated_nudge: string;
  generated_derailer: string;
  generated_intention: string;
  evening_energy: number | null;
  wins: string;
  drains: string;
  tomorrow_priority: string;
  evening_reflections: string;
  evening_closing: string;
}

interface TimeBlock {
  time: string;
  label: string;
  duration: string;
  species_note: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [mode, setMode] = useState<'morning' | 'evening'>('morning');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/ritual').then((r) => r.json()),
    ]).then(([authData, ritualData]) => {
      if (!authData.user) {
        router.push('/');
        return;
      }
      if (!authData.user.profile_complete) {
        router.push('/onboarding');
        return;
      }
      setUser(authData.user);
      setEntry(ritualData.entry);

      // Time-gate: after 5pm, default to evening mode
      const hour = new Date().getHours();
      if (hour >= 17) setMode('evening');

      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-earth-400 animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }

  const species = user?.primary_species ? SPECIES[user.primary_species as keyof typeof SPECIES] : null;
  const hasMorningRitual = entry?.generated_schedule && entry.generated_schedule !== '[]';

  return (
    <div className="min-h-screen bg-earth-50">
      <Nav />
      <div className="pt-20 pb-8 max-w-2xl mx-auto px-4">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-earth-900 font-serif">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          {species && (
            <p className="text-earth-600 text-sm mt-1">
              {species.emoji} {species.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-earth-100 mb-6">
          <button
            onClick={() => setMode('morning')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'morning'
                ? 'bg-forest-500 text-white shadow-sm'
                : 'text-earth-600 hover:text-earth-800'
            }`}
          >
            🌅 Morning Ritual
          </button>
          <button
            onClick={() => setMode('evening')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'evening'
                ? 'bg-forest-500 text-white shadow-sm'
                : 'text-earth-600 hover:text-earth-800'
            }`}
          >
            🌙 Evening Review
          </button>
        </div>

        {mode === 'morning' ? (
          <MorningRitual
            user={user}
            species={species}
            entry={entry}
            hasMorningRitual={!!hasMorningRitual}
            onUpdate={setEntry}
          />
        ) : (
          <EveningReview
            user={user}
            species={species}
            entry={entry}
            onUpdate={setEntry}
          />
        )}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Morning Ritual ───

function MorningRitual({
  user,
  species,
  entry,
  hasMorningRitual,
  onUpdate,
}: {
  user: any;
  species: Species | null;
  entry: DailyEntry | null;
  hasMorningRitual: boolean;
  onUpdate: (entry: DailyEntry) => void;
}) {
  const [energy, setEnergy] = useState(entry?.morning_energy || 3);
  const [notes, setNotes] = useState(entry?.morning_notes || '');
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);
  const [nudge, setNudge] = useState('');
  const [derailer, setDerailer] = useState('');
  const [intention, setIntention] = useState('');

  useEffect(() => {
    if (entry?.generated_schedule) {
      try {
        setSchedule(JSON.parse(entry.generated_schedule));
      } catch {}
    }
    if (entry?.generated_nudge) setNudge(entry.generated_nudge);
    if (entry?.generated_derailer) setDerailer(entry.generated_derailer);
    if (entry?.generated_intention) setIntention(entry.generated_intention);
  }, [entry]);

  async function generateMorningRitual() {
    setGenerating(true);
    try {
      const res = await fetch('/api/ritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'morning', energyLevel: energy, notes }),
      });
      const data = await res.json();
      if (data.ritual) {
        setSchedule(data.ritual.time_blocks || []);
        setNudge(data.ritual.coaching_nudge || '');
        setDerailer(data.ritual.derailer_watch || '');
        setIntention(data.ritual.morning_intention_prompt || '');
      }
    } catch (err) {
      console.error('Ritual generation error:', err);
    }
    setGenerating(false);
  }

  return (
    <div className="space-y-6">
      {/* Species Intention */}
      {species && !hasMorningRitual && (
        <div
          className="card"
          style={{ borderLeft: `4px solid ${species.color}` }}
        >
          <p className="text-sm text-earth-500 mb-1">
            {species.emoji} Species Intention
          </p>
          <p className="text-earth-800 font-medium">{species.morningPrompt}</p>
        </div>
      )}

      {/* Energy Check-In */}
      {!hasMorningRitual && (
        <div className="card">
          <h3 className="font-semibold text-earth-900 mb-4">Energy Check-In</h3>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-earth-500 mb-2">
              <span>Low</span>
              <span className="font-medium text-lg">
                {['😴', '😐', '🙂', '😊', '⚡'][energy - 1]} {energy}/5
              </span>
              <span>High</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="label">Any context for today?</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="e.g. big meeting, poor sleep, feeling focused..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button
            onClick={generateMorningRitual}
            disabled={generating}
            className="btn-primary w-full mt-4"
          >
            {generating ? 'Generating your ritual...' : 'Generate My Morning Ritual'}
          </button>
        </div>
      )}

      {/* Generated Ritual */}
      {(hasMorningRitual || schedule.length > 0) && (
        <>
          {/* Coaching Nudge */}
          {nudge && (
            <div className="card bg-forest-50 border-forest-100">
              <p className="text-xs text-forest-600 font-medium mb-1">Coaching Nudge</p>
              <p className="text-sm text-earth-800 leading-relaxed">{nudge}</p>
            </div>
          )}

          {/* Intention */}
          {intention && (
            <div
              className="card"
              style={{ borderLeft: `4px solid ${species?.color || '#5B7553'}` }}
            >
              <p className="text-xs text-earth-500 mb-1">Morning Intention</p>
              <p className="text-earth-800 font-medium">{intention}</p>
            </div>
          )}

          {/* Time Blocks */}
          {schedule.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-earth-900 mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                {schedule.map((block, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 rounded-xl bg-earth-50 hover:bg-earth-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-earth-500 w-20 shrink-0">
                      {block.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-earth-900 text-sm">{block.label}</div>
                      <div className="text-xs text-earth-500 mt-0.5">
                        {block.duration} · {block.species_note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Derailer Watch */}
          {derailer && (
            <div className="card bg-amber-50 border-amber-100">
              <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Derailer Watch</p>
              <p className="text-sm text-earth-800">{derailer}</p>
            </div>
          )}

          {/* Regenerate option */}
          <button
            onClick={generateMorningRitual}
            disabled={generating}
            className="btn-secondary w-full text-sm"
          >
            {generating ? 'Regenerating...' : 'Regenerate Ritual'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Evening Review ───

function EveningReview({
  user,
  species,
  entry,
  onUpdate,
}: {
  user: any;
  species: Species | null;
  entry: DailyEntry | null;
  onUpdate: (entry: DailyEntry) => void;
}) {
  const [eveningEnergy, setEveningEnergy] = useState(entry?.evening_energy || 3);
  const [wins, setWins] = useState(entry?.wins || '');
  const [drains, setDrains] = useState(entry?.drains || '');
  const [tomorrowPriority, setTomorrowPriority] = useState(entry?.tomorrow_priority || '');
  const [reflections, setReflections] = useState<string[]>([]);
  const [closingNote, setClosingNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (entry?.evening_reflections) {
      try {
        setReflections(JSON.parse(entry.evening_reflections));
      } catch {}
    }
    if (entry?.evening_closing) setClosingNote(entry.evening_closing);
  }, [entry]);

  async function generateReflection() {
    setGenerating(true);
    try {
      const res = await fetch('/api/ritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evening_generate' }),
      });
      const data = await res.json();
      if (data.reflection) {
        setReflections(data.reflection.reflection_questions || []);
        setClosingNote(data.reflection.closing_note || '');
      }
    } catch (err) {
      console.error('Reflection error:', err);
    }
    setGenerating(false);
  }

  async function saveEvening() {
    try {
      await fetch('/api/ritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evening_save',
          eveningEnergy,
          wins,
          drains,
          tomorrowPriority,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Reflection Questions */}
      {reflections.length === 0 ? (
        <div className="card text-center">
          <p className="text-earth-600 mb-4 text-sm">
            Generate your species-specific evening reflection questions.
          </p>
          <button
            onClick={generateReflection}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? 'Generating...' : 'Generate Evening Reflection'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ borderLeft: `4px solid ${species?.color || '#5B7553'}` }}>
          <p className="text-xs text-earth-500 font-medium mb-3">
            {species?.emoji} Reflection Questions
          </p>
          <ol className="space-y-3">
            {reflections.map((q, i) => (
              <li key={i} className="text-sm text-earth-800 leading-relaxed">
                <span className="text-earth-400 mr-2">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Energy Check-Out */}
      <div className="card">
        <h3 className="font-semibold text-earth-900 mb-4">Evening Energy</h3>
        <div className="flex justify-between text-xs text-earth-500 mb-2">
          <span>Depleted</span>
          <span className="font-medium text-lg">
            {['😴', '😐', '🙂', '😊', '⚡'][eveningEnergy - 1]} {eveningEnergy}/5
          </span>
          <span>Energized</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={eveningEnergy}
          onChange={(e) => setEveningEnergy(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Wins & Drains */}
      <div className="card">
        <h3 className="font-semibold text-earth-900 mb-4">Wins & Drains</h3>
        <div className="space-y-4">
          <div>
            <label className="label text-forest-700">Wins today</label>
            <textarea
              className="input min-h-[60px] resize-none"
              placeholder="What went well?"
              value={wins}
              onChange={(e) => setWins(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-amber-700">Drains today</label>
            <textarea
              className="input min-h-[60px] resize-none"
              placeholder="What drained your energy?"
              value={drains}
              onChange={(e) => setDrains(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tomorrow's Priority */}
      <div className="card">
        <label className="label">Tomorrow's Top Priority</label>
        <input
          type="text"
          className="input"
          placeholder="The one thing that matters most tomorrow"
          value={tomorrowPriority}
          onChange={(e) => setTomorrowPriority(e.target.value)}
        />
      </div>

      {/* Closing Note */}
      {closingNote && (
        <div className="card bg-forest-50 border-forest-100">
          <p className="text-xs text-forest-600 font-medium mb-1">
            {species?.emoji} Evening Note
          </p>
          <p className="text-sm text-earth-800 leading-relaxed">{closingNote}</p>
        </div>
      )}

      {/* Save */}
      <button onClick={saveEvening} className="btn-primary w-full">
        {saved ? '✓ Saved!' : 'Save Evening Review'}
      </button>
    </div>
  );
}
