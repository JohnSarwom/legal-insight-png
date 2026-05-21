import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Plus, MessageSquare, Trash2, Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import {
  loadThreads,
  saveThreads,
  newThread,
  type ChatThread,
} from "@/lib/chat-threads";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — PNG Legal AI" },
      { name: "description", content: "Ask PNG legal questions and get grounded, cited answers." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once
  useEffect(() => {
    const existing = loadThreads();
    setThreads(existing);
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated) saveThreads(threads);
  }, [threads, hydrated]);

  const upsertThread = useCallback((t: ChatThread) => {
    setThreads((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      const next = [...prev];
      if (idx === -1) next.unshift(t);
      else next[idx] = t;
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      return next;
    });
  }, []);

  const handleNew = () => {
    const t = newThread();
    upsertThread(t);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (params.threadId === id) navigate({ to: "/chat" });
  };

  // unused helper removed

  return (
    <AppLayout>
      <div className="h-screen flex bg-background text-foreground">
        {/* Chat history Sidebar */}
        <aside className="w-72 shrink-0 border-r border-border/60 bg-surface/40 flex flex-col">
          <div className="p-4 border-b border-border/60">
            <span className="text-sm font-semibold">Conversations</span>
          </div>

          <div className="p-3">
            <Button
              onClick={handleNew}
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 shadow-glow"
            >
              <Plus className="h-4 w-4" /> New conversation
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2">
            {!hydrated ? null : threads.length === 0 ? (
              <p className="px-3 py-6 text-xs text-muted-foreground">
                No conversations yet. Start a new one.
              </p>
            ) : (
              <ul className="space-y-0.5 pb-4">
                {threads.map((t) => {
                  const active = t.id === params.threadId;
                  return (
                    <li key={t.id} className="group relative">
                      <Link
                        to="/chat/$threadId"
                        params={{ threadId: t.id }}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors pr-8",
                          active
                            ? "bg-primary/15 text-foreground"
                            : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                        )}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(t.id);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-border/60">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              History is saved in this browser
            </p>
          </div>
        </aside>

        {/* Main chat area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}
