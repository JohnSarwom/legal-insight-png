import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "png-legal-ai.threads.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadThreads(): ChatThread[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ChatThread[];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    /* quota */
  }
}

export function newThread(): ChatThread {
  return {
    id:
      isBrowser() && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36),
    title: "New conversation",
    updatedAt: Date.now(),
    messages: [],
  };
}

export function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "New conversation";
  return text.length > 60 ? text.slice(0, 57) + "…" : text;
}
