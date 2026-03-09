"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ConversationFeed from "@/components/dashboard/ConversationFeed";

interface Conversation {
  id: string;
  title: string | null;
  summary: string | null;
  startedAt: string;
  clientProfile: { user: { name: string } };
  messages: { content: string }[];
}

export default function ConversationsPage() {
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
      <Sidebar role="COACH" userName="Coach" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5">
          <h1 className="text-xl font-semibold">All Conversations</h1>
          <p className="text-sm text-[var(--muted)]">AI coaching conversations across all clients</p>
        </header>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading conversations...</div>
          ) : (
            <ConversationFeed conversations={conversations} />
          )}
        </div>
      </main>
    </div>
  );
}
