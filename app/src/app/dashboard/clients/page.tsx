"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ClientList from "@/components/dashboard/ClientList";
import { Plus } from "lucide-react";

interface Client {
  id: string;
  status: string;
  mode: string;
  title: string | null;
  company: string | null;
  user: { name: string; email: string; avatarUrl: string | null };
  goals: { status: string }[];
  conversations: { startedAt: string; messages: { content: string; createdAt: string }[] }[];
  alerts: { id: string }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", title: "", company: "", industry: "", teamSize: "", mode: "COMPANION",
  });

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", email: "", title: "", company: "", industry: "", teamSize: "", mode: "COMPANION" });
    const res = await fetch("/api/clients");
    setClients(await res.json());
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="COACH" userName="Coach" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Clients</h1>
            <p className="text-sm text-[var(--muted)]">Manage your coaching clients</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
          >
            <Plus size={16} />
            Add Client
          </button>
        </header>

        <div className="p-8">
          {showForm && (
            <form onSubmit={handleAddClient} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" placeholder="VP of Engineering" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Company</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Industry</label>
                <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Team Size</label>
                <input type="number" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Engagement Mode</label>
                <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
                  <option value="COMPANION">Companion (with live coaching)</option>
                  <option value="STANDALONE">Standalone (AI only)</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">Add Client</button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-[var(--border)] px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading clients...</div>
          ) : (
            <ClientList clients={clients} />
          )}
        </div>
      </main>
    </div>
  );
}
