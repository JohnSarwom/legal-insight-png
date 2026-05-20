import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  FileText,
  MessagesSquare,
  Library,
  Search,
  Upload,
  Sparkles,
  Scale,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PNG Legal AI" },
      { name: "description", content: "Your legal AI workspace." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const display =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Counsel";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 border-r border-border/60 bg-surface/50 p-5 hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Scale className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">PNG Legal AI</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Workspace
            </span>
          </div>
        </Link>

        <nav className="space-y-1 text-sm flex-1">
          <NavItem icon={Sparkles} label="Overview" active />
          <NavItem icon={MessagesSquare} label="AI Chat" to="/chat" />
          <NavItem icon={Library} label="Knowledge" to="/knowledge" />
          <NavItem icon={Upload} label="Upload center" to="/knowledge" />
          <NavItem icon={Search} label="Search" soon />
          <NavItem icon={FileText} label="Documents" to="/knowledge" />
        </nav>

        <div className="rounded-lg border border-border/60 bg-surface-elevated p-3 text-xs">
          <p className="font-medium truncate">{display}</p>
          <p className="text-muted-foreground truncate">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {(roles.length ? roles : ["client"]).map((r) => (
              <span
                key={r}
                className="rounded-md bg-primary/15 text-primary-glow border border-primary/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
              >
                {r}
              </span>
            ))}
          </div>
          <Button
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="w-full mt-3 justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:pl-60">
        <div className="container max-w-6xl px-6 py-12">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary-glow">Overview</p>
              <h1 className="mt-2 font-display text-4xl tracking-tight text-gradient">
                Welcome back, {display.split(" ")[0]}.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your secure legal AI workspace is ready. AI features ship next.
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-glow gap-2">
              <Link to="/knowledge"><Upload className="h-4 w-4" /> Upload documents</Link>
            </Button>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Documents" value="0" />
            <Stat label="Knowledge bases" value="0" />
            <Stat label="AI queries this month" value="0" />
            <Stat label="Storage used" value="0 MB" />
          </div>

          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            <ComingSoonCard
              icon={MessagesSquare}
              title="AI Chat"
              body="Ask grounded legal questions and get cited answers from your knowledge bases."
            />
            <ComingSoonCard
              icon={Library}
              title="Knowledge bases"
              body="Group documents by matter, jurisdiction, or practice area."
            />
            <ComingSoonCard
              icon={Search}
              title="Semantic search"
              body="Find passages by meaning across thousands of pages."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-border/60 bg-surface p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-primary-glow">What's next</p>
            <h2 className="mt-2 font-display text-2xl tracking-tight">
              v2 ships the AI core
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Document upload &amp; OCR · pgvector RAG pipeline · streaming Gemini chat with
              citations · knowledge base management · semantic search. Reply in chat to
              prioritize the next module.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  soon,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  soon?: boolean;
  to?: string;
}) {
  const inner = (
    <div
      className={`flex items-center justify-between rounded-md px-3 py-2 ${
        active
          ? "bg-primary/15 text-foreground"
          : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
      } ${to ? "cursor-pointer" : ""}`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {soon && (
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">
          soon
        </span>
      )}
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-5 shadow-card">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight">{value}</p>
    </div>
  );
}

function ComingSoonCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 border border-primary/20 text-primary-glow">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
      <span className="mt-4 inline-block text-[10px] uppercase tracking-widest text-primary-glow">
        Coming next
      </span>
    </div>
  );
}
