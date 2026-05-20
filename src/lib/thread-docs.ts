// Per-thread document selection persisted in localStorage.
const KEY = "png-legal-ai.thread-docs.v1";

type Map = Record<string, string[]>;

function read(): Map {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Map) : {};
  } catch {
    return {};
  }
}

function write(m: Map) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* quota */
  }
}

export function getThreadDocs(threadId: string): string[] {
  return read()[threadId] ?? [];
}

export function setThreadDocs(threadId: string, docIds: string[]) {
  const m = read();
  m[threadId] = docIds;
  write(m);
}
