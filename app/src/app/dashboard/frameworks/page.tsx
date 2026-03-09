"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Plus, BookOpen } from "lucide-react";

interface Framework {
  id: string;
  name: string;
  purpose: string;
  steps: string;
  keyQuestions: string | null;
  commonPitfalls: string | null;
  successIndicators: string | null;
}

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", purpose: "", steps: "", keyQuestions: "", commonPitfalls: "", successIndicators: "",
  });

  useEffect(() => {
    fetch("/api/frameworks")
      .then((res) => res.json())
      .then(setFrameworks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/frameworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", purpose: "", steps: "", keyQuestions: "", commonPitfalls: "", successIndicators: "" });
    const res = await fetch("/api/frameworks");
    setFrameworks(await res.json());
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="COACH" userName="Coach" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Coaching Frameworks</h1>
            <p className="text-sm text-[var(--muted)]">Your methodology — the AI can only reference frameworks listed here</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
          >
            <Plus size={16} />
            Add Framework
          </button>
        </header>

        <div className="p-8">
          {showForm && (
            <form onSubmit={handleAdd} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Framework Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" placeholder="e.g., SBI Feedback Model" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Purpose *</label>
                <textarea required rows={2} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" placeholder="When to use this framework and what problem it solves" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Steps *</label>
                <textarea required rows={4} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" placeholder="Step-by-step process..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Key Coaching Questions</label>
                <textarea rows={3} value={form.keyQuestions} onChange={(e) => setForm({ ...form, keyQuestions: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" placeholder="Questions you typically ask when using this framework" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Common Pitfalls</label>
                  <textarea rows={2} value={form.commonPitfalls} onChange={(e) => setForm({ ...form, commonPitfalls: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Success Indicators</label>
                  <textarea rows={2} value={form.successIndicators} onChange={(e) => setForm({ ...form, successIndicators: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">Save Framework</button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-[var(--border)] px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading frameworks...</div>
          ) : frameworks.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={32} className="mx-auto text-[var(--muted)] mb-3" />
              <p className="text-[var(--muted)]">No frameworks yet.</p>
              <p className="text-sm text-[var(--muted)] mt-1">Add your coaching frameworks so the AI can reference them accurately.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {frameworks.map((fw) => (
                <div key={fw.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-[var(--primary)]" />
                    <h3 className="text-sm font-semibold">{fw.name}</h3>
                  </div>
                  <p className="text-sm text-[var(--muted)] mb-3">{fw.purpose}</p>
                  <div className="bg-[var(--background)] rounded-lg p-3">
                    <p className="text-xs font-medium text-[var(--muted)] mb-1">Steps</p>
                    <p className="text-sm whitespace-pre-wrap">{fw.steps}</p>
                  </div>
                  {fw.keyQuestions && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-[var(--muted)] mb-1">Key Questions</p>
                      <p className="text-sm text-[var(--muted)]">{fw.keyQuestions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
