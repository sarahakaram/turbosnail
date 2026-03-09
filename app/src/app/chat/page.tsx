import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/layout/Sidebar";

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <Sidebar role="CLIENT" userName="Client" />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <h1 className="text-lg font-semibold">Coaching Session</h1>
          <p className="text-xs text-[var(--muted)]">Your AI coach is here to support you</p>
        </header>
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
