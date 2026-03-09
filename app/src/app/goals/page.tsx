"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Target, Plus } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  targetDate: string | null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client fetches their own goals via the conversations API
    // For MVP, we'll show a placeholder
    setLoading(false);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar role="CLIENT" userName="Client" />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-8 py-5">
          <h1 className="text-xl font-semibold">My Goals</h1>
          <p className="text-sm text-[var(--muted)]">Track your development goals and commitments</p>
        </header>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-20">
              <Target size={32} className="mx-auto text-[var(--muted)] mb-3" />
              <p className="text-[var(--muted)]">No goals set yet.</p>
              <p className="text-sm text-[var(--muted)] mt-1">Your coach will set goals with you during your sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target size={16} className="text-[var(--primary)]" />
                      <p className="text-sm font-medium">{goal.title}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      goal.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      goal.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {goal.status.replace("_", " ").toLowerCase()}
                    </span>
                  </div>
                  {goal.description && <p className="text-sm text-[var(--muted)] mt-2 ml-7">{goal.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
