'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { SPECIES, SPECIES_LIST } from '@/lib/species';
import type { SpeciesSlug } from '@/lib/species';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [chronotype, setChronotype] = useState('mid');
  const [priorities, setPriorities] = useState(['', '', '']);
  const [values, setValues] = useState('');
  const [teamRole, setTeamRole] = useState('solo');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push('/');
          return;
        }
        setUser(data.user);
        setName(data.user.name);
        setChronotype(data.user.chronotype);
        const p = data.user.weekly_priorities || [];
        setPriorities([p[0] || '', p[1] || '', p[2] || '']);
        setValues((data.user.core_values || []).join(', '));
        setTeamRole(data.user.team_role);
        setLoading(false);
      });
  }, [router]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        chronotype,
        weekly_priorities: priorities.filter((p) => p.trim()),
        core_values: values
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        team_role: teamRole,
      }),
    });
    const data = await res.json();
    setUser(data.user);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-earth-400 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const species = user?.primary_species
    ? SPECIES[user.primary_species as SpeciesSlug]
    : null;
  const secondary = user?.secondary_species
    ? SPECIES[user.secondary_species as SpeciesSlug]
    : null;

  return (
    <div className="min-h-screen bg-earth-50">
      <Nav />
      <div className="pt-20 pb-8 max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-earth-900 font-serif">My Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              Edit
            </button>
          )}
        </div>

        {/* Species Card */}
        {species && (
          <div
            className="card mb-6 relative overflow-hidden"
            style={{ borderTop: `4px solid ${species.color}` }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: species.color + '15' }}
              >
                {species.emoji}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-earth-900">
                  {species.name}
                  {secondary && (
                    <span className="text-earth-400 font-normal text-base ml-2">
                      + {secondary.emoji} {secondary.name}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-earth-600 mt-1">{species.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-earth-50 rounded-xl p-3">
                <div className="text-xs text-earth-500 mb-1">Processing Style</div>
                <div className="text-sm font-medium text-earth-800">
                  {species.processingStyle}
                </div>
              </div>
              <div className="bg-earth-50 rounded-xl p-3">
                <div className="text-xs text-earth-500 mb-1">Activated By</div>
                <div className="text-sm font-medium text-earth-800">{species.activation}</div>
              </div>
              <div className="bg-earth-50 rounded-xl p-3">
                <div className="text-xs text-earth-500 mb-1">Storm Response</div>
                <div className="text-sm font-medium text-earth-800">
                  {species.stormResponse}
                </div>
              </div>
              <div className="bg-earth-50 rounded-xl p-3">
                <div className="text-xs text-earth-500 mb-1">Core Derailer</div>
                <div className="text-sm font-medium text-earth-800">
                  {species.coreDerailer}
                </div>
              </div>
              <div className="bg-earth-50 rounded-xl p-3">
                <div className="text-xs text-earth-500 mb-1">Learning Style</div>
                <div className="text-sm font-medium text-earth-800">
                  {species.learningStyle}
                </div>
                <div className="text-xs text-earth-500 mt-0.5">
                  {species.learningDescription}
                </div>
              </div>
              <div className="bg-earth-50 rounded-xl p-3">
                <div className="text-xs text-earth-500 mb-1">Drivers</div>
                <div className="text-sm font-medium text-earth-800">
                  {species.primaryDriver} · {species.secondaryDriver}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="card">
          {editing ? (
            <div className="space-y-5">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Chronotype</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'early', label: 'Early Bird', icon: '🌅' },
                    { value: 'mid', label: 'Mid-Day', icon: '☀️' },
                    { value: 'night', label: 'Night Owl', icon: '🌙' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setChronotype(c.value)}
                      className={`p-3 rounded-xl text-center text-sm transition-all ${
                        chronotype === c.value
                          ? 'bg-forest-50 ring-2 ring-forest-500 font-medium'
                          : 'bg-earth-50 hover:bg-earth-100'
                      }`}
                    >
                      <span className="text-xl">{c.icon}</span>
                      <div className="mt-1">{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Weekly Priorities</label>
                {priorities.map((p, i) => (
                  <input
                    key={i}
                    type="text"
                    className="input mb-2"
                    placeholder={`Priority ${i + 1}`}
                    value={p}
                    onChange={(e) => {
                      const next = [...priorities];
                      next[i] = e.target.value;
                      setPriorities(next);
                    }}
                  />
                ))}
              </div>

              <div>
                <label className="label">Core Values</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Comma-separated"
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Team Role</label>
                <select
                  className="input"
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                >
                  <option value="solo">Solo Leader</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="member">Team Member</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-earth-100">
                <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-lg">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-earth-900">{user?.name}</div>
                  <div className="text-sm text-earth-500">{user?.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-earth-500 mb-1">Chronotype</div>
                  <div className="text-sm text-earth-800">
                    {chronotype === 'early'
                      ? '🌅 Early Bird'
                      : chronotype === 'night'
                      ? '🌙 Night Owl'
                      : '☀️ Mid-Day'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-earth-500 mb-1">Team Role</div>
                  <div className="text-sm text-earth-800 capitalize">
                    {teamRole.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {user?.weekly_priorities?.length > 0 && (
                <div>
                  <div className="text-xs text-earth-500 mb-2">Weekly Priorities</div>
                  <ul className="space-y-1">
                    {user.weekly_priorities.map((p: string, i: number) => (
                      <li key={i} className="text-sm text-earth-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-700 text-xs flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {user?.core_values?.length > 0 && (
                <div>
                  <div className="text-xs text-earth-500 mb-2">Core Values</div>
                  <div className="flex gap-2 flex-wrap">
                    {user.core_values.map((v: string, i: number) => (
                      <span
                        key={i}
                        className="species-badge bg-earth-100 text-earth-700"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {saved && (
                <div className="text-sm text-forest-600 bg-forest-50 rounded-lg px-4 py-2">
                  Profile updated!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
