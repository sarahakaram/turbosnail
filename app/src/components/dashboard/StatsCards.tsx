"use client";

import { Users, MessageSquare, AlertTriangle, TrendingUp } from "lucide-react";

interface Stats {
  totalClients: number;
  activeClients: number;
  pendingAlerts: number;
  totalConversations: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Active Clients",
      value: stats.activeClients,
      total: stats.totalClients,
      icon: Users,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary-light)]",
    },
    {
      label: "AI Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      color: "text-[var(--success)]",
      bg: "bg-green-50",
    },
    {
      label: "Pending Alerts",
      value: stats.pendingAlerts,
      icon: AlertTriangle,
      color: stats.pendingAlerts > 0 ? "text-[var(--danger)]" : "text-[var(--muted)]",
      bg: stats.pendingAlerts > 0 ? "bg-red-50" : "bg-gray-50",
    },
    {
      label: "Engagement Rate",
      value: stats.totalClients > 0 ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0,
      suffix: "%",
      icon: TrendingUp,
      color: "text-[var(--accent)]",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--muted)]">{card.label}</span>
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {card.value}
              {card.suffix || ""}
              {"total" in card && (
                <span className="text-sm font-normal text-[var(--muted)] ml-1">
                  / {card.total}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
