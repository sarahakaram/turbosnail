"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  createdAt: string;
  clientProfile: {
    user: { name: string };
  };
}

const alertIcons: Record<string, typeof AlertTriangle> = {
  MENTAL_HEALTH: ShieldAlert,
  STUCK: Clock,
  DISENGAGED: AlertTriangle,
  MILESTONE: CheckCircle,
  ESCALATION: AlertTriangle,
};

const alertColors: Record<string, string> = {
  MENTAL_HEALTH: "border-l-red-500 bg-red-50",
  STUCK: "border-l-amber-500 bg-amber-50",
  DISENGAGED: "border-l-orange-500 bg-orange-50",
  MILESTONE: "border-l-green-500 bg-green-50",
  ESCALATION: "border-l-red-400 bg-red-50",
};

export default function AlertsFeed({
  alerts,
  onResolve,
}: {
  alerts: Alert[];
  onResolve: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)] text-sm">
        No pending alerts. All clients are on track.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alertIcons[alert.type] || AlertTriangle;
        const colorClass = alertColors[alert.type] || "border-l-gray-400 bg-gray-50";

        return (
          <div
            key={alert.id}
            className={`border-l-4 ${colorClass} rounded-r-lg p-4`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {alert.clientProfile.user.name} &middot;{" "}
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-1">{alert.description}</p>
                </div>
              </div>
              <button
                onClick={() => onResolve(alert.id)}
                className="text-xs text-[var(--primary)] hover:underline shrink-0 ml-2"
              >
                Resolve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
