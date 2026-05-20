import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  ScrollText,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import {
  createDocument,
  deleteDocument,
  listDocuments,
  processDocument,
} from "@/lib/documents.functions";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — PNG Legal AI" },
      { name: "description", content: "Upload legal documents and build your AI-grounded knowledge base." },
    ],
  }),
  component: KnowledgePage,
});

type DocRow = {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  status: "pending" | "processing" | "ready" | "failed";
  error: string | null;
  page_count: number | null;
  chunk_count: number;
  created_at: string;
};

const ACCEPTED = ".pdf,.docx,.txt";
const MIME_OK = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const MAX_BYTES = 50 * 1024 * 1024;

function KnowledgePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const list = useServerFn(listDocuments);
  const create = useServerFn(createDocument);
  const process = useServerFn(processDocument);
  const remove = useServerFn(deleteDocument);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const refresh = useCallback(async () => {
    try {
      const res = await list();
      setDocs(res.documents as DocRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load documents");
    }
  }, [list]);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  // Poll while anything is processing
  useEffect(() => {
    const active = docs.some((d) => d.status === "processing" || d.status === "pending");
    if (!active) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [docs, refresh]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (arr.length === 0) return;
      setBusy(true);
      for (const file of arr) {
        if (!MIME_OK.has(file.type)) {
          toast.error(`${file.name}: unsupported type`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: exceeds 50 MB limit`);
          continue;
        }
        try {
          const { id, storage_path } = await create({
            data: { filename: file.name, mime: file.type, size: file.size },
          });
          const { error: upErr } = await supabase.storage
            .from("documents")
            .upload(storage_path, file, { contentType: file.type, upsert: false });
          if (upErr) throw new Error(upErr.message);
          await refresh();
          // Fire-and-forget processing
          process({ data: { id } })
            .then(() => refresh())
            .catch((e) => {
              toast.error(`${file.name}: ${e instanceof Error ? e.message : "processing failed"}`);
              void refresh();
            });
          toast.success(`${file.name} uploaded — indexing started`);
        } catch (e) {
          toast.error(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
        }
      }
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    },
    [create, process, refresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const prev = docs;
      setDocs((d) => d.filter((x) => x.id !== id));
      try {
        await remove({ data: { id } });
      } catch (e) {
        setDocs(prev);
        toast.error(e instanceof Error ? e.message : "Delete failed");
      }
    },
    [docs, remove],
  );

  const totalBytes = useMemo(() => docs.reduce((s, d) => s + d.size_bytes, 0), [docs]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-surface/40 backdrop-blur">
        <div className="container max-w-5xl px-6 py-4 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="font-display text-lg tracking-tight">Knowledge</h1>
        </div>
      </header>

      <main className="container max-w-5xl px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary-glow">Documents</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-gradient">
              Your legal corpus
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Upload PDFs, Word documents, and text files. Each document is parsed, chunked, and
              embedded so the AI can cite passages back to you in chat.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{docs.length} document{docs.length === 1 ? "" : "s"}</p>
            <p>{formatBytes(totalBytes)} stored</p>
          </div>
        </div>

        {/* Dropzone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`mt-8 block rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/40 bg-surface/40"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="sr-only"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary/10 border border-primary/20 text-primary-glow">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          </div>
          <p className="mt-4 text-sm font-medium">
            Drop files here or <span className="text-primary-glow">click to browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF · DOCX · TXT &middot; up to 50 MB per file
          </p>
        </label>

        {/* List */}
        <section className="mt-10">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Library
          </h3>
          {docs.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-surface px-6 py-12 text-center">
              <ScrollText className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="mt-3 text-sm text-muted-foreground">
                No documents yet. Upload your first to start grounded chat.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-surface overflow-hidden">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-surface-elevated border border-border/60 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(d.size_bytes)}
                      {d.page_count ? ` · ${d.page_count} pages` : ""}
                      {d.chunk_count ? ` · ${d.chunk_count} chunks` : ""}
                      {" · "}
                      {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                    </p>
                    {d.status === "failed" && d.error && (
                      <p className="text-xs text-destructive mt-0.5 truncate">{d.error}</p>
                    )}
                  </div>
                  <StatusBadge status={d.status} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(d.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10 flex justify-end">
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-glow">
            <Link to="/chat">Open AI Chat →</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: DocRow["status"] }) {
  const map = {
    pending: { Icon: Loader2, cls: "text-muted-foreground", label: "Queued", spin: true },
    processing: { Icon: Loader2, cls: "text-primary-glow", label: "Indexing", spin: true },
    ready: { Icon: CheckCircle2, cls: "text-emerald-400", label: "Ready", spin: false },
    failed: { Icon: XCircle, cls: "text-destructive", label: "Failed", spin: false },
  }[status];
  const { Icon, cls, label, spin } = map;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cls}`}>
      <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
