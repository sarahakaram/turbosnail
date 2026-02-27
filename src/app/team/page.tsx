'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { SPECIES, SPECIES_LIST } from '@/lib/species';
import type { SpeciesSlug } from '@/lib/species';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  primary_species: string | null;
  secondary_species: string | null;
}

interface FrictionAnalysis {
  friction_pairs: { pair: string; description: string }[];
  blind_spots: string[];
  storm_prediction: string;
  ritual_questions: string[];
}

interface TeamRitual {
  id: string;
  ritual_type: string;
  content: { prompt: string; facilitator_note: string };
  created_at: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [rituals, setRituals] = useState<TeamRitual[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingRitual, setGeneratingRitual] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [authRes, teamRes] = await Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/team').then((r) => r.json()),
    ]);

    if (!authRes.user) {
      router.push('/');
      return;
    }
    setUser(authRes.user);
    setTeam(teamRes.team);
    setMembers(teamRes.members || []);
    setRituals(teamRes.rituals || []);
    setLoading(false);
  }

  async function createTeam() {
    if (!teamName.trim()) return;
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: teamName }),
    });
    await res.json();
    setTeamName('');
    loadData();
  }

  async function addMember() {
    setInviteError('');
    setInviteSuccess('');
    if (!inviteEmail.trim()) return;

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_member', email: inviteEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteError(data.error);
    } else {
      setInviteSuccess(`${inviteEmail} added to the team!`);
      setInviteEmail('');
      loadData();
    }
  }

  async function analyzeFriction() {
    setAnalyzing(true);
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze_friction' }),
    });
    const data = await res.json();
    if (data.analysis) {
      setTeam((prev: any) => ({ ...prev, frictionAnalysis: data.analysis }));
    }
    setAnalyzing(false);
  }

  async function generateRitual(ritualType: string) {
    setGeneratingRitual(ritualType);
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_ritual', ritualType }),
    });
    const data = await res.json();
    if (data.ritual) {
      setRituals((prev) => [
        {
          id: data.ritualId,
          ritual_type: ritualType,
          content: data.ritual,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setGeneratingRitual('');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-earth-400 animate-pulse">Loading team...</div>
      </div>
    );
  }

  const isLeader = team?.leaderId === user?.id;

  return (
    <div className="min-h-screen bg-earth-50">
      <Nav />
      <div className="pt-20 pb-8 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-earth-900 font-serif mb-6">My Team</h1>

        {/* No team yet */}
        {!team && (
          <div className="card text-center">
            <div className="text-4xl mb-3">🌱</div>
            <h2 className="text-lg font-semibold text-earth-900 mb-2">Create Your Team</h2>
            <p className="text-sm text-earth-600 mb-4">
              Start by creating a team, then invite your members. Everyone completes their own
              species discovery to build the team map.
            </p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="text"
                className="input"
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <button onClick={createTeam} className="btn-primary shrink-0">
                Create
              </button>
            </div>
          </div>
        )}

        {/* Team exists */}
        {team && (
          <div className="space-y-6">
            {/* Species Map */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-earth-900">
                  {team.name} — Species Map
                </h2>
                <span className="text-sm text-earth-500">{members.length} members</span>
              </div>

              {/* Visual species grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {members.map((m) => {
                  const sp = m.primary_species
                    ? SPECIES[m.primary_species as SpeciesSlug]
                    : null;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 p-3 rounded-xl bg-earth-50"
                      style={sp ? { borderLeft: `3px solid ${sp.color}` } : {}}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                        style={{
                          backgroundColor: sp ? sp.color + '15' : '#f0ebe0',
                        }}
                      >
                        {sp?.emoji || '❓'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-earth-900 truncate">
                          {m.name}
                        </div>
                        <div className="text-xs text-earth-500">
                          {sp?.name || 'Pending discovery'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Species Distribution */}
              <SpeciesDistribution members={members} />
            </div>

            {/* Add Member */}
            {isLeader && (
              <div className="card">
                <h3 className="font-semibold text-earth-900 mb-3">Add Team Member</h3>
                <p className="text-xs text-earth-500 mb-3">
                  The person must already have a Wild Growth account.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="input"
                    placeholder="team@member.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button onClick={addMember} className="btn-primary shrink-0">
                    Add
                  </button>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-600 mt-2">{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p className="text-sm text-forest-600 mt-2">{inviteSuccess}</p>
                )}
              </div>
            )}

            {/* Friction Analysis */}
            {isLeader && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-earth-900">Friction Analysis</h3>
                  <button
                    onClick={analyzeFriction}
                    disabled={analyzing}
                    className="btn-secondary text-sm"
                  >
                    {analyzing
                      ? 'Analyzing...'
                      : team.frictionAnalysis
                      ? 'Refresh'
                      : 'Run Analysis'}
                  </button>
                </div>

                {team.frictionAnalysis ? (
                  <FrictionDisplay analysis={team.frictionAnalysis} />
                ) : (
                  <p className="text-sm text-earth-500">
                    Run a friction analysis to see how your team's species interact under pressure.
                  </p>
                )}
              </div>
            )}

            {/* Team Rituals */}
            {isLeader && (
              <div className="card">
                <h3 className="font-semibold text-earth-900 mb-4">Team Ritual Generator</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { type: 'Daily Standup', icon: '🌅' },
                    { type: 'Weekly Check-in', icon: '📋' },
                    { type: 'Pre-Meeting Alignment', icon: '🎯' },
                    { type: 'Retrospective', icon: '🔄' },
                  ].map((r) => (
                    <button
                      key={r.type}
                      onClick={() => generateRitual(r.type)}
                      disabled={!!generatingRitual}
                      className="p-3 rounded-xl bg-earth-50 hover:bg-earth-100 text-left transition-colors disabled:opacity-50"
                    >
                      <span className="text-lg">{r.icon}</span>
                      <div className="text-sm font-medium text-earth-800 mt-1">{r.type}</div>
                      {generatingRitual === r.type && (
                        <div className="text-xs text-forest-600 mt-1">Generating...</div>
                      )}
                    </button>
                  ))}
                </div>

                {rituals.length > 0 && (
                  <div className="space-y-3 border-t border-earth-100 pt-4">
                    <p className="text-xs text-earth-500 font-medium">Recent Rituals</p>
                    {rituals.map((ritual) => (
                      <div key={ritual.id} className="bg-forest-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-forest-700">
                            {ritual.ritual_type}
                          </span>
                          <span className="text-xs text-earth-400">
                            {new Date(ritual.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-earth-800 font-medium mb-2">
                          {ritual.content.prompt}
                        </p>
                        <p className="text-xs text-earth-600 italic">
                          {ritual.content.facilitator_note}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SpeciesDistribution({ members }: { members: TeamMember[] }) {
  const counts: Record<string, number> = {};
  const processingStyles: Record<string, number> = {
    Internal: 0,
    External: 0,
  };

  members.forEach((m) => {
    if (m.primary_species) {
      counts[m.primary_species] = (counts[m.primary_species] || 0) + 1;
      const sp = SPECIES[m.primary_species as SpeciesSlug];
      if (sp) {
        if (
          sp.processingStyle.includes('Internal') ||
          sp.processingStyle === 'Structured' ||
          sp.processingStyle === 'Hyper-Focused' ||
          sp.processingStyle === 'Scaffolded'
        ) {
          processingStyles.Internal++;
        } else {
          processingStyles.External++;
        }
      }
    }
  });

  const speciesEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (speciesEntries.length === 0) return null;

  return (
    <div className="border-t border-earth-100 pt-4">
      <p className="text-xs text-earth-500 font-medium mb-2">Species Distribution</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {speciesEntries.map(([slug, count]) => {
          const sp = SPECIES[slug as SpeciesSlug];
          return sp ? (
            <span
              key={slug}
              className="species-badge"
              style={{
                backgroundColor: sp.color + '15',
                color: sp.color,
                border: `1px solid ${sp.color}30`,
              }}
            >
              {sp.emoji} {count} {sp.name}
              {count > 1 ? 's' : ''}
            </span>
          ) : null;
        })}
      </div>
      <div className="flex gap-4 text-xs text-earth-600">
        <span>
          Internal processors: <strong>{processingStyles.Internal}</strong>
        </span>
        <span>
          External processors: <strong>{processingStyles.External}</strong>
        </span>
      </div>
    </div>
  );
}

function FrictionDisplay({ analysis }: { analysis: FrictionAnalysis }) {
  return (
    <div className="space-y-4">
      {/* Friction Pairs */}
      {analysis.friction_pairs?.length > 0 && (
        <div>
          <p className="text-xs text-earth-500 font-medium mb-2">Likely Friction Points</p>
          <div className="space-y-2">
            {analysis.friction_pairs.map((fp, i) => (
              <div key={i} className="bg-amber-50 rounded-lg p-3">
                <div className="text-sm font-medium text-amber-800">{fp.pair}</div>
                <div className="text-xs text-earth-600 mt-1">{fp.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blind Spots */}
      {analysis.blind_spots?.length > 0 && (
        <div>
          <p className="text-xs text-earth-500 font-medium mb-2">Blind Spots</p>
          <ul className="space-y-1">
            {analysis.blind_spots.map((bs, i) => (
              <li key={i} className="text-sm text-earth-700 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">●</span>
                {bs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Storm Prediction */}
      {analysis.storm_prediction && (
        <div className="bg-earth-50 rounded-lg p-3">
          <p className="text-xs text-earth-500 font-medium mb-1">Under Collective Stress</p>
          <p className="text-sm text-earth-700">{analysis.storm_prediction}</p>
        </div>
      )}

      {/* Ritual Questions */}
      {analysis.ritual_questions?.length > 0 && (
        <div>
          <p className="text-xs text-earth-500 font-medium mb-2">Team Ritual Questions</p>
          <ol className="space-y-2">
            {analysis.ritual_questions.map((q, i) => (
              <li key={i} className="text-sm text-earth-700">
                <span className="text-earth-400 mr-2">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
