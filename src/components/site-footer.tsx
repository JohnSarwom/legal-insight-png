import { Scale } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-32">
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow">
            <Scale className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium">PNG Legal AI</span>
          <span className="text-xs text-muted-foreground ml-2">
            Document intelligence for Papua New Guinea
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PNG Legal AI. Grounded responses. Verifiable citations.
        </p>
      </div>
    </footer>
  );
}
