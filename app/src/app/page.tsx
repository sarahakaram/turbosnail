import Link from "next/link";
import { MessageSquare, LayoutDashboard, Shield, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">AI Executive Coach</h1>
        <p className="text-lg text-[var(--muted)] mb-8 max-w-lg mx-auto">
          Your coach, available anytime — grounded in your goals, your data, and your journey.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: Brain, label: "Personalized Coaching", desc: "Grounded in your assessments, goals, and journey" },
            { icon: MessageSquare, label: "Text & Voice", desc: "Natural conversations anytime, anywhere" },
            { icon: Shield, label: "No Hallucination", desc: "Only references real frameworks and your data" },
            { icon: LayoutDashboard, label: "Full Visibility", desc: "Coach and client dashboards with progress tracking" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-left"
            >
              <feature.icon size={20} className="text-[var(--primary)] mb-2" />
              <p className="text-sm font-medium">{feature.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageSquare size={16} />
            Start Coaching Session
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-[var(--border)] rounded-xl px-6 py-3 text-sm font-medium hover:bg-[var(--card)] transition-colors"
          >
            <LayoutDashboard size={16} />
            Coach Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
