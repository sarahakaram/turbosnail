'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SPECIES_LIST } from '@/lib/species';
import type { Species, SpeciesSlug } from '@/lib/species';

type Step = 'interview' | 'confirm' | 'profile';

interface InterviewResult {
  primary_species: string;
  secondary_species: string;
  confidence: number;
  key_observations: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-earth-400">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(
    (searchParams.get('step') as Step) || 'interview'
  );

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur border-b border-earth-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xl">🌿</span>
          <div className="flex-1 flex gap-2">
            {(['interview', 'confirm', 'profile'] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s === step
                    ? 'bg-forest-500'
                    : ['confirm', 'profile'].indexOf(s) <=
                      ['confirm', 'profile'].indexOf(step)
                    ? 'bg-forest-200'
                    : 'bg-earth-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-earth-500 capitalize">{step}</span>
        </div>
      </div>

      <div className="pt-16 pb-8">
        {step === 'interview' && (
          <InterviewStep
            onComplete={(result) => {
              setStep('confirm');
            }}
          />
        )}
        {step === 'confirm' && (
          <ConfirmStep onComplete={() => setStep('profile')} />
        )}
        {step === 'profile' && <ProfileStep onComplete={() => router.push('/dashboard')} />}
      </div>
    </div>
  );
}

// ─── Interview Step ───

function InterviewStep({ onComplete }: { onComplete: (result: InterviewResult) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    startInterview();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startInterview() {
    setLoading(true);
    try {
      // Check for existing messages
      const res = await fetch('/api/interview');
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        // Check if last message has result
        const lastAssistant = data.messages
          .filter((m: Message) => m.role === 'assistant')
          .pop();
        if (lastAssistant) {
          const jsonMatch = lastAssistant.content.match(/```json\s*([\s\S]*?)```/);
          if (jsonMatch) {
            try {
              const r = JSON.parse(jsonMatch[1]);
              if (r.status === 'complete') setResult(r);
            } catch {}
          }
        }
        setLoading(false);
        return;
      }

      // Start fresh interview
      const startRes = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: null }),
      });
      const startData = await startRes.json();
      setMessages([
        {
          role: 'user',
          content:
            "Hi, I'd like to discover my Wild Growth species. I'm ready to start the interview.",
        },
        { role: 'assistant', content: startData.reply },
      ]);
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
    setLoading(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

      if (data.result?.status === 'complete') {
        setResult(data.result);
      }
    } catch (err) {
      console.error('Interview error:', err);
    }
    setLoading(false);
  }

  function stripJson(text: string): string {
    return text.replace(/```json[\s\S]*?```/g, '').trim();
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-earth-900 font-serif">Discover Your Species</h2>
        <p className="text-earth-600 text-sm mt-1">
          Have a conversation with your coach to discover your growth pattern.
        </p>
      </div>

      <div className="space-y-4 mb-4">
        {messages.slice(1).map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {stripJson(msg.content)}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-forest-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-forest-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-forest-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {result ? (
        <div className="card text-center">
          <p className="text-earth-600 mb-4">Your species has been identified!</p>
          <button onClick={() => onComplete(result)} className="btn-primary">
            See Your Results →
          </button>
        </div>
      ) : (
        <form onSubmit={sendMessage} className="sticky bottom-4">
          <div className="flex gap-2 bg-white rounded-2xl shadow-lg border border-earth-100 p-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-sm"
              placeholder="Share your thoughts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary !px-5 !py-2.5 !rounded-xl"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Confirm Step ───

function ConfirmStep({ onComplete }: { onComplete: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [primary, setPrimary] = useState<SpeciesSlug | ''>('');
  const [secondary, setSecondary] = useState<SpeciesSlug | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.user.primary_species) setPrimary(data.user.primary_species);
          if (data.user.secondary_species) setSecondary(data.user.secondary_species);
        }
      });

    // Try to get interview result from messages
    fetch('/api/interview')
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          const lastAssistant = [...data.messages]
            .reverse()
            .find((m: Message) => m.role === 'assistant');
          if (lastAssistant) {
            const jsonMatch = lastAssistant.content.match(/```json\s*([\s\S]*?)```/);
            if (jsonMatch) {
              try {
                const r = JSON.parse(jsonMatch[1]);
                if (r.primary_species && !primary) setPrimary(r.primary_species);
                if (r.secondary_species && !secondary) setSecondary(r.secondary_species);
              } catch {}
            }
          }
        }
      });
  }, []);

  async function handleConfirm() {
    if (!primary) return;
    setSaving(true);
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primary_species: primary,
        secondary_species: secondary || null,
      }),
    });
    setSaving(false);
    onComplete();
  }

  const primarySpecies = SPECIES_LIST.find((s) => s.slug === primary);
  const secondarySpecies = SPECIES_LIST.find((s) => s.slug === secondary);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-earth-900 font-serif">Confirm Your Species</h2>
        <p className="text-earth-600 text-sm mt-1">
          Self-knowledge requires reflection, not just algorithm output. <br />
          Review the recommendation and make it yours.
        </p>
      </div>

      {/* Primary Species */}
      <div className="mb-6">
        <label className="label">Primary Species</label>
        <div className="grid grid-cols-1 gap-3">
          {SPECIES_LIST.map((species) => (
            <button
              key={species.slug}
              onClick={() => setPrimary(species.slug)}
              className={`card text-left transition-all cursor-pointer ${
                primary === species.slug
                  ? 'ring-2 ring-offset-2 shadow-md'
                  : 'hover:shadow-md opacity-75 hover:opacity-100'
              }`}
              style={
                primary === species.slug
                  ? { borderColor: species.color, '--tw-ring-color': species.color } as React.CSSProperties
                  : {}
              }
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{species.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-earth-900">{species.name}</span>
                    <span
                      className="species-badge text-xs"
                      style={{ backgroundColor: species.color + '20', color: species.color }}
                    >
                      {species.processingStyle}
                    </span>
                  </div>
                  <p className="text-sm text-earth-600 mt-1">{species.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-earth-500">
                    <span>Learning: {species.learningStyle}</span>
                    <span>
                      Drivers: {species.primaryDriver} / {species.secondaryDriver}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Species */}
      <div className="mb-8">
        <label className="label">Secondary Species (optional)</label>
        <select
          className="input"
          value={secondary}
          onChange={(e) => setSecondary(e.target.value as SpeciesSlug)}
        >
          <option value="">None</option>
          {SPECIES_LIST.filter((s) => s.slug !== primary).map((species) => (
            <option key={species.slug} value={species.slug}>
              {species.emoji} {species.name}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      {primarySpecies && (
        <div className="card mb-6" style={{ borderLeft: `4px solid ${primarySpecies.color}` }}>
          <h3 className="font-semibold text-earth-900 mb-2">
            {primarySpecies.emoji} Your Pattern: {primarySpecies.name}
            {secondarySpecies ? ` + ${secondarySpecies.name}` : ''}
          </h3>
          <p className="text-sm text-earth-600 mb-3">{primarySpecies.description}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-earth-50 rounded-lg p-3">
              <div className="text-earth-500 mb-1">Storm Response</div>
              <div className="text-earth-800">{primarySpecies.stormResponse}</div>
            </div>
            <div className="bg-earth-50 rounded-lg p-3">
              <div className="text-earth-500 mb-1">Core Derailer</div>
              <div className="text-earth-800">{primarySpecies.coreDerailer}</div>
            </div>
            <div className="bg-earth-50 rounded-lg p-3">
              <div className="text-earth-500 mb-1">Learning Style</div>
              <div className="text-earth-800">{primarySpecies.learningDescription}</div>
            </div>
            <div className="bg-earth-50 rounded-lg p-3">
              <div className="text-earth-500 mb-1">Drivers</div>
              <div className="text-earth-800">
                {primarySpecies.primaryDriver} / {primarySpecies.secondaryDriver}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!primary || saving}
        className="btn-primary w-full"
      >
        {saving ? 'Saving...' : 'Confirm My Species →'}
      </button>
    </div>
  );
}

// ─── Profile Step ───

function ProfileStep({ onComplete }: { onComplete: () => void }) {
  const [chronotype, setChronotype] = useState<'early' | 'mid' | 'night'>('mid');
  const [priorities, setPriorities] = useState(['', '', '']);
  const [values, setValues] = useState('');
  const [teamRole, setTeamRole] = useState('solo');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chronotype,
        weekly_priorities: priorities.filter((p) => p.trim()),
        core_values: values
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        team_role: teamRole,
        profile_complete: true,
      }),
    });
    setSaving(false);
    onComplete();
  }

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-earth-900 font-serif">Complete Your Profile</h2>
        <p className="text-earth-600 text-sm mt-1">
          A few more details to personalize your daily ritual.
        </p>
      </div>

      <div className="space-y-6">
        {/* Chronotype */}
        <div>
          <label className="label">Chronotype</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'early', label: 'Early Bird', icon: '🌅', desc: 'Peak energy: morning' },
              { value: 'mid', label: 'Mid-Day', icon: '☀️', desc: 'Peak energy: midday' },
              { value: 'night', label: 'Night Owl', icon: '🌙', desc: 'Peak energy: evening' },
            ].map((c) => (
              <button
                key={c.value}
                onClick={() => setChronotype(c.value as any)}
                className={`card text-center cursor-pointer transition-all ${
                  chronotype === c.value
                    ? 'ring-2 ring-forest-500 ring-offset-2'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="font-medium text-sm">{c.label}</div>
                <div className="text-xs text-earth-500">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Priorities */}
        <div>
          <label className="label">Top 3 Weekly Priorities</label>
          <p className="text-xs text-earth-500 mb-2">
            What matters most this week? Refresh these each Monday.
          </p>
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

        {/* Core Values */}
        <div>
          <label className="label">Core Values</label>
          <p className="text-xs text-earth-500 mb-2">1–3 words, separated by commas</p>
          <input
            type="text"
            className="input"
            placeholder="e.g. integrity, growth, connection"
            value={values}
            onChange={(e) => setValues(e.target.value)}
          />
        </div>

        {/* Team Role */}
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

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Start My Journey →'}
        </button>
      </div>
    </div>
  );
}
