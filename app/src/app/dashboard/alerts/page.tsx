"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AlertsFeed from "@/components/dashboard/AlertsFeed";

interface Alert {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  createdAt: string;
  clientProfile: { user: { name: string } };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setAlerts(data.recentAlerts || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleResolve = async (id: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    fetchAlerts();
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="COACH" userName="Coach" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5">
          <h1 className="text-xl font-semibold">Alerts</h1>
          <p className="text-sm text-[var(--muted)]">Escalations and flags from AI coaching sessions</p>
        </header>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading alerts...</div>
          ) : (
            <AlertsFeed alerts={alerts} onResolve={handleResolve} />
          )}
        </div>
      </main>
    </div>
  );
}
