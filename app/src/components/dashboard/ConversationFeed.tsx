"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

interface ConversationSummary {
  id: string;
  title: string | null;
  summary: string | null;
  startedAt: string;
  clientProfile: {
    user: { name: string };
  };
  messages: { content: string }[];
}

export default function ConversationFeed({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)] text-sm">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => {
        const preview = conv.messages[0]?.content || conv.title || "No messages";

        return (
          <div
            key={conv.id}
            className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[var(--primary-light)] rounded-lg shrink-0">
                <MessageSquare size={14} className="text-[var(--primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{conv.clientProfile.user.name}</p>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDistanceToNow(new Date(conv.startedAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)] mt-1 truncate">
                  {preview.substring(0, 120)}
                  {preview.length > 120 ? "..." : ""}
                </p>
                {conv.summary && (
                  <p className="text-xs text-[var(--primary)] mt-1">Summary available</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
