import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { loadThreads, saveThreads, deriveTitle, type ChatThread } from "@/lib/chat-threads";
import legalMark from "@/assets/legal-ai-mark.png";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  return <ChatWindow key={threadId} threadId={threadId} />;
}

function ChatWindow({ threadId }: { threadId: string }) {
  // Load initial messages from localStorage once per thread
  const initial = useMemo<UIMessage[]>(() => {
    const t = loadThreads().find((x) => x.id === threadId);
    return t?.messages ?? [];
  }, [threadId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (e) => {
      console.error(e);
      toast.error(e.message || "Chat request failed");
    },
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus on mount and after status returns to idle
  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  // Persist messages to localStorage whenever they change and stream is idle
  useEffect(() => {
    if (status === "submitted" || status === "streaming") return;
    if (messages.length === 0) return;
    const existing = loadThreads();
    const idx = existing.findIndex((t) => t.id === threadId);
    const base: ChatThread =
      idx === -1
        ? { id: threadId, title: deriveTitle(messages), updatedAt: Date.now(), messages }
        : { ...existing[idx], title: deriveTitle(messages), updatedAt: Date.now(), messages };
    const next = idx === -1 ? [base, ...existing] : existing.map((t, i) => (i === idx ? base : t));
    next.sort((a, b) => b.updatedAt - a.updatedAt);
    saveThreads(next);
  }, [messages, status, threadId]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-8">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((m) => <ChatMessage key={m.id} message={m} />)
          )}
          {status === "submitted" && (
            <div className="mt-2 pl-1">
              <Shimmer>Consulting PNG legal sources…</Shimmer>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 bg-surface/40 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <PromptInput
            onSubmit={(_msg, e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about PNG law…"
              disabled={isLoading}
            />
            <PromptInputFooter className="justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                General legal information · Not legal advice
              </p>
              <PromptInputSubmit
                status={status}
                disabled={!input.trim() || isLoading}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");

  if (message.role === "user") {
    return (
      <Message from="user" className="mb-6">
        <MessageContent className="bg-primary text-primary-foreground">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant" className="mb-6">
      <div className="flex gap-3">
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10">
          <Scale className="h-3.5 w-3.5 text-primary-glow" strokeWidth={2.5} />
        </div>
        <div className="prose prose-sm prose-invert min-w-0 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-primary-glow prose-code:bg-surface-elevated prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-elevated prose-pre:border prose-pre:border-border/60">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </Message>
  );
}

function EmptyState() {
  const samples = [
    "Summarize the rights guaranteed under Section 37 of the PNG Constitution.",
    "What is the difference between Underlying Law and customary law in PNG?",
    "Explain the requirements for a valid contract under PNG law.",
    "How are land disputes resolved under the Land Disputes Settlement Act?",
  ];

  return (
    <div className="mx-auto max-w-2xl text-center py-12">
      <img
        src={legalMark}
        alt=""
        width={72}
        height={72}
        className="mx-auto h-18 w-18 opacity-90"
      />
      <h2 className="mt-4 font-display text-2xl tracking-tight text-gradient">
        How can I help with PNG law today?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Ask about statutes, constitutional rights, case law, or procedure.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-2.5 text-left">
        {samples.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              const el = document.querySelector<HTMLTextAreaElement>(
                'textarea[placeholder^="Ask a question"]',
              );
              if (el) {
                el.value = s;
                el.focus();
                el.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }}
            className="rounded-lg border border-border/60 bg-surface px-4 py-3 text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground hover:border-primary/30 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
