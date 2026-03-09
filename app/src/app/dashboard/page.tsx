"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import ConversationFeed from "@/components/dashboard/ConversationFeed";
import ClientList from "@/components/dashboard/ClientList";

interface DashboardData {
  stats: {
    totalClients: number;
    activeClients: number;
    pendingAlerts: number;
    totalConversations: number;
  };
  clients: Array<{
    id: string;
    status: string;
    mode: string;
    title: string | null;
    company: string | null;
    user: { name: string; email: string; avatarUrl: string | null };
    goals: { status: string }[];
    conversations: { startedAt: string; messages: { content: string; createdAt: string }[] }[];
    alerts: { id: string }[];
  }>;
  recentAlerts: Array<{
    id: string;
    type: string;
    status: string;
    title: string;
    description: string;
    createdAt: string;
    clientProfile: { user: { name: string } };
  }>;
  recentConversations: Array<{
    id: string;
    title: string | null;
    summary: string | null;
    startedAt: string;
    clientProfile: { user: { name: string } };
    messages: { content: string }[];
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    // Refresh dashboard
    const res = await fetch("/api/dashboard");
    setData(await res.json());
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="COACH" userName="Coach" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5">
          <h1 className="text-xl font-semibold">Coach Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Overview of your coaching practice</p>
        </header>

        <div className="p-8 space-y-8">
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading dashboard...</div>
          ) : data ? (
            <>
              <StatsCards stats={data.stats} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts */}
                <div>
                  <h2 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
                    Pending Alerts
                  </h2>
                  <AlertsFeed alerts={data.recentAlerts} onResolve={handleResolveAlert} />
                </div>

                {/* Recent Conversations */}
                <div>
                  <h2 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
                    Recent Conversations
                  </h2>
                  <ConversationFeed conversations={data.recentConversations} />
                </div>
              </div>

              {/* Client List */}
              <div>
                <h2 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
                  All Clients
                </h2>
                <ClientList clients={data.clients} />
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-[var(--muted)]">
              Failed to load dashboard. Please try again.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
