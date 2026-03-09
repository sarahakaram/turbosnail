"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string | null;
  summary: string | null;
  startedAt: string;
  messages: { content: string }[];
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar role="CLIENT" userName="Client" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5">
          <h1 className="text-xl font-semibold">Session History</h1>
          <p className="text-sm text-[var(--muted)]">Review your past coaching conversations</p>
        </header>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading history...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare size={32} className="mx-auto text-[var(--muted)] mb-3" />
              <p className="text-[var(--muted)]">No conversations yet.</p>
              <p className="text-sm text-[var(--muted)] mt-1">Start a coaching session to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-[var(--primary)]" />
                    <div className="flex-1">
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
        </div>
      </main>
    </div>
  );
}
