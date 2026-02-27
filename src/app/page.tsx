'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const body = mode === 'signup' ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Redirect based on user state
      if (!data.user.interview_complete) {
        router.push('/onboarding');
      } else if (!data.user.profile_complete) {
        router.push('/onboarding?step=confirm');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (mode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🌿</div>
            <h1 className="text-4xl font-bold text-earth-900 mb-3 font-serif">Wild Growth</h1>
            <p className="text-lg text-earth-600">
              Know yourself deeply. Organize your energy intentionally.
              <br />
              Lead your team with clarity.
            </p>
          </div>

          <div className="card mb-6">
            <p className="text-earth-600 mb-6 text-sm leading-relaxed">
              Discover your growth pattern species, then get a personalized daily ritual —
              morning intention, energy-aware schedule, coaching nudges, and evening reflection —
              all shaped by how you actually process the world.
            </p>

            <div className="space-y-3">
              <button onClick={() => setMode('signup')} className="btn-primary w-full">
                Get Started
              </button>
              <button onClick={() => setMode('login')} className="btn-outline w-full">
                Sign In
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-3 text-2xl">
            <span title="Baobab">🌳</span>
            <span title="Mangrove">🌿</span>
            <span title="Bamboo">🎋</span>
            <span title="Strangler Fig">🪴</span>
            <span title="Willow">🌾</span>
            <span title="Oak">🌲</span>
            <span title="Aspen Grove">🌱</span>
          </div>
          <p className="text-xs text-earth-400 mt-2">Seven species. Your pattern awaits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setMode('landing')}
          className="text-earth-500 hover:text-earth-700 mb-6 text-sm"
        >
          ← Back
        </button>

        <div className="card">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🌿</div>
            <h2 className="text-2xl font-bold text-earth-900 font-serif">
              {mode === 'signup' ? 'Begin Your Journey' : 'Welcome Back'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-earth-500 mt-4">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setError('');
              }}
              className="text-forest-600 hover:text-forest-700 font-medium"
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
