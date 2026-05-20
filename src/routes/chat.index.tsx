import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadThreads, newThread, saveThreads } from "@/lib/chat-threads";
import legalMark from "@/assets/legal-ai-mark.png";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    // If a thread already exists, navigate to the most recent one
    const existing = loadThreads();
    if (existing.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: existing[0].id }, replace: true });
    }
  }, [navigate]);

  const start = () => {
    const t = newThread();
    const existing = loadThreads();
    saveThreads([t, ...existing]);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  return (
    <div className="h-full grid place-items-center px-6">
      <div className="max-w-md text-center">
        <img
          src={legalMark}
          alt="PNG Legal AI mark"
          width={96}
          height={96}
          className="mx-auto h-24 w-24 opacity-90"
        />
        <h1 className="mt-6 font-display text-3xl tracking-tight text-gradient">
          Ask PNG Legal AI
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Get grounded answers on PNG statutes, case law, and constitutional matters.
          Start a new conversation to begin.
        </p>
        <Button
          onClick={start}
          className="mt-6 bg-primary hover:bg-primary/90 shadow-glow gap-2"
        >
          <Sparkles className="h-4 w-4" /> Start a new conversation
        </Button>
      </div>
    </div>
  );
}
