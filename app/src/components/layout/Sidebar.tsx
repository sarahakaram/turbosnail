"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  BookOpen,
  Target,
  Bell,
} from "lucide-react";

const coachNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { label: "Frameworks", href: "/dashboard/frameworks", icon: BookOpen },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
];

const clientNavItems = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "My Goals", href: "/goals", icon: Target },
  { label: "History", href: "/history", icon: BookOpen },
];

interface SidebarProps {
  role: "COACH" | "CLIENT";
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "COACH" ? coachNavItems : clientNavItems;

  return (
    <aside className="w-64 h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold">AI Coach</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">{userName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                  : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="p-4 border-t border-[var(--border)]">
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-medium">
          {role === "COACH" ? "Coach View" : "Client View"}
        </span>
      </div>
    </aside>
  );
}
