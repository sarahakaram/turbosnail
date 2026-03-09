"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, AlertTriangle } from "lucide-react";

interface ClientSummary {
  id: string;
  status: string;
  mode: string;
  title: string | null;
  company: string | null;
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  goals: { status: string }[];
  conversations: {
    startedAt: string;
    messages: { content: string; createdAt: string }[];
  }[];
  alerts: { id: string }[];
}

export default function ClientList({ clients }: { clients: ClientSummary[] }) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)]">No clients yet.</p>
        <Link
          href="/dashboard/clients/new"
          className="text-[var(--primary)] text-sm hover:underline mt-2 inline-block"
        >
          Add your first client
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client) => {
        const activeGoals = client.goals.filter((g) => g.status === "IN_PROGRESS").length;
        const lastConversation = client.conversations[0];
        const hasAlerts = client.alerts.length > 0;

        return (
          <Link
            key={client.id}
            href={`/dashboard/clients/${client.id}`}
            className="flex items-center justify-between p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-semibold text-sm">
                {client.user.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{client.user.name}</p>
                  {hasAlerts && <AlertTriangle size={14} className="text-[var(--danger)]" />}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      client.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {client.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {[client.title, client.company].filter(Boolean).join(" at ") || client.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-[var(--muted)]">
                  {activeGoals > 0 ? `${activeGoals} active goal${activeGoals > 1 ? "s" : ""}` : "No active goals"}
                </p>
                {lastConversation && (
                  <p className="text-xs text-[var(--muted)]">
                    Last chat {formatDistanceToNow(new Date(lastConversation.startedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
              <ChevronRight size={16} className="text-[var(--muted)] group-hover:text-[var(--primary)]" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
