import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Check, FileText, Loader2, Paperclip, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listDocuments } from "@/lib/documents.functions";
import { cn } from "@/lib/utils";

type Doc = {
  id: string;
  filename: string;
  status: "pending" | "processing" | "ready" | "failed";
};

export function DocumentPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const list = useServerFn(listDocuments);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    list()
      .then((r) => {
        if (!cancelled) setDocs(r.documents as Doc[]);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [list, open]);

  const ready = docs.filter((d) => d.status === "ready");
  const selectedCount = selected.length;

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 border-border/60",
            selectedCount > 0 && "border-primary/40 text-primary-glow",
          )}
        >
          <Paperclip className="h-3.5 w-3.5" />
          {selectedCount === 0
            ? "Attach documents"
            : `${selectedCount} document${selectedCount === 1 ? "" : "s"} attached`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-80 p-0 bg-surface border-border/60"
      >
        <div className="px-3 py-2.5 border-b border-border/60 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Ground answers on
          </p>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {loading ? (
            <div className="px-3 py-6 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading library…
            </div>
          ) : ready.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                {docs.length === 0
                  ? "No documents yet."
                  : "No documents are ready for retrieval yet."}
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 gap-1.5">
                <Link to="/knowledge">
                  <Upload className="h-3.5 w-3.5" /> Upload documents
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="py-1">
              {ready.map((d) => {
                const active = selected.includes(d.id);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => toggle(d.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-surface-elevated",
                        active && "text-foreground",
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{d.filename}</span>
                      {active && <Check className="h-3.5 w-3.5 text-primary-glow" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
        <div className="px-3 py-2 border-t border-border/60">
          <Link
            to="/knowledge"
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Manage library →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
