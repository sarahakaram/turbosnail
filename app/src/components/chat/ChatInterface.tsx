"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, BookOpen, AlertTriangle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  metadata?: {
    frameworksReferenced?: string[];
    confidenceLevel?: string;
    escalationTriggered?: boolean;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          createdAt: new Date().toISOString(),
          metadata: {
            frameworksReferenced: data.frameworksReferenced,
            escalationTriggered: data.escalationTriggered,
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
            <p className="text-[var(--muted)] max-w-md mx-auto">
              I&apos;m here to support your leadership journey. What&apos;s on your mind today?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] border border-[var(--border)] shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>

              {/* Framework references badge */}
              {message.metadata?.frameworksReferenced &&
                message.metadata.frameworksReferenced.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.metadata.frameworksReferenced.map((fw) => (
                      <span
                        key={fw}
                        className="inline-flex items-center gap-1 text-xs bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded-full"
                      >
                        <BookOpen size={10} />
                        {fw}
                      </span>
                    ))}
                  </div>
                )}

              {/* Escalation warning */}
              {message.metadata?.escalationTriggered && (
                <div className="mt-2 flex items-center gap-1 text-xs text-[var(--accent)]">
                  <AlertTriangle size={12} />
                  Coach has been notified
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
                <Loader2 size={16} className="animate-spin" />
                Coach is thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)]"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-[var(--primary)] text-white p-2.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
