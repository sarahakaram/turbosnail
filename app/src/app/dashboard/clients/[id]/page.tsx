"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import Sidebar from "@/components/layout/Sidebar";
import {
  ArrowLeft,
  Target,
  FileText,
  MessageSquare,
  AlertTriangle,
  Plus,
} from "lucide-react";

interface ClientDetail {
  id: string;
  status: string;
  mode: string;
  title: string | null;
  company: string | null;
  industry: string | null;
  teamSize: number | null;
  reportingTo: string | null;
  engagementStart: string | null;
  user: { name: string; email: string };
  goals: {
    id: string;
    title: string;
    status: string;
    description: string | null;
    targetDate: string | null;
  }[];
  assessments: {
    id: string;
    type: string;
    title: string;
    summary: string | null;
    administeredAt: string;
  }[];
  conversations: {
    id: string;
    title: string | null;
    summary: string | null;
    startedAt: string;
    messages: { content: string }[];
  }[];
  sessionNotes: {
    id: string;
    sessionDate: string;
    notes: string;
    focusAreas: string | null;
    commitments: string | null;
  }[];
  alerts: {
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "conversations" | "notes">("overview");

  // Session note form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ sessionDate: "", notes: "", focusAreas: "", commitments: "" });

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then((res) => res.json())
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/clients/${params.id}/session-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteForm),
    });
    setShowNoteForm(false);
    setNoteForm({ sessionDate: "", notes: "", focusAreas: "", commitments: "" });
    // Refresh
    const res = await fetch(`/api/clients/${params.id}`);
    setClient(await res.json());
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar role="COACH" userName="Coach" />
        <main className="flex-1 flex items-center justify-center text-[var(--muted)]">Loading...</main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-screen">
        <Sidebar role="COACH" userName="Coach" />
        <main className="flex-1 flex items-center justify-center text-[var(--muted)]">Client not found</main>
      </div>
    );
  }

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "conversations" as const, label: `Conversations (${client.conversations.length})` },
    { key: "notes" as const, label: `Session Notes (${client.sessionNotes.length})` },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar role="COACH" userName="Coach" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-3">
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{client.user.name}</h1>
              <p className="text-sm text-[var(--muted)]">
                {[client.title, client.company].filter(Boolean).join(" at ")}
                {client.engagementStart && (
                  <> &middot; Since {format(new Date(client.engagementStart), "MMM yyyy")}</>
                )}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              client.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {client.mode.toLowerCase()} &middot; {client.status.toLowerCase()}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[var(--primary)] text-[var(--primary)] font-medium"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="p-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Goals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-2">
                    <Target size={14} />
                    Goals
                  </h2>
                </div>
                {client.goals.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No goals set yet.</p>
                ) : (
                  <div className="space-y-3">
                    {client.goals.map((goal) => (
                      <div key={goal.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{goal.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            goal.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                            goal.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {goal.status.replace("_", " ").toLowerCase()}
                          </span>
                        </div>
                        {goal.description && <p className="text-xs text-[var(--muted)] mt-1">{goal.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessments */}
              <div>
                <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-2 mb-4">
                  <FileText size={14} />
                  Assessments
                </h2>
                {client.assessments.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No assessments uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {client.assessments.map((assessment) => (
                      <div key={assessment.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{assessment.title}</p>
                          <span className="text-xs text-[var(--muted)]">{assessment.type}</span>
                        </div>
                        {assessment.summary && <p className="text-xs text-[var(--muted)] mt-1">{assessment.summary}</p>}
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {format(new Date(assessment.administeredAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Alerts */}
              {client.alerts.length > 0 && (
                <div className="lg:col-span-2">
                  <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <AlertTriangle size={14} />
                    Recent Alerts
                  </h2>
                  <div className="space-y-2">
                    {client.alerts.map((alert) => (
                      <div key={alert.id} className="bg-red-50 border-l-4 border-l-red-400 rounded-r-lg p-3">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "conversations" && (
            <div className="space-y-3">
              {client.conversations.map((conv) => (
                <div key={conv.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-[var(--primary)]" />
                    <div>
                      <p className="text-sm font-medium">{conv.title || "Coaching Session"}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatDistanceToNow(new Date(conv.startedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {conv.summary && (
                    <div className="mt-3 text-sm text-[var(--muted)] bg-[var(--background)] rounded-lg p-3">
                      {conv.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline mb-4"
              >
                <Plus size={14} />
                Add Session Note
              </button>

              {showNoteForm && (
                <form onSubmit={handleAddNote} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">Session Date</label>
                    <input
                      type="date"
                      required
                      value={noteForm.sessionDate}
                      onChange={(e) => setNoteForm({ ...noteForm, sessionDate: e.target.value })}
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">Notes</label>
                    <textarea
                      required
                      rows={4}
                      value={noteForm.notes}
                      onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                      placeholder="Key discussion points, insights, breakthroughs..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">Focus Areas</label>
                    <input
                      value={noteForm.focusAreas}
                      onChange={(e) => setNoteForm({ ...noteForm, focusAreas: e.target.value })}
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                      placeholder="Delegation, feedback, presence..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">Commitments</label>
                    <input
                      value={noteForm.commitments}
                      onChange={(e) => setNoteForm({ ...noteForm, commitments: e.target.value })}
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                      placeholder="Have the delegation conversation with Jamie by Friday..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                    >
                      Save Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="border border-[var(--border)] px-4 py-2 rounded-lg text-sm hover:bg-[var(--background)]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {client.sessionNotes.map((note) => (
                  <div key={note.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-xs text-[var(--muted)] mb-2">
                      {format(new Date(note.sessionDate), "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm">{note.notes}</p>
                    {note.focusAreas && (
                      <p className="text-xs text-[var(--muted)] mt-2">
                        <span className="font-medium">Focus:</span> {note.focusAreas}
                      </p>
                    )}
                    {note.commitments && (
                      <p className="text-xs text-[var(--muted)] mt-1">
                        <span className="font-medium">Commitments:</span> {note.commitments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
