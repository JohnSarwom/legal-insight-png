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
import { AppLayout } from "@/components/app-layout";

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
    <AppLayout>
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
              accentColor="from-blue-500 to-cyan-500"
            />
            <ComingSoonCard
              icon={Library}
              title="Knowledge bases"
              body="Group documents by matter, jurisdiction, or practice area."
              accentColor="from-purple-500 to-pink-500"
            />
            <ComingSoonCard
              icon={Search}
              title="Semantic search"
              body="Find passages by meaning across thousands of pages."
              accentColor="from-amber-500 to-orange-500"
            />
          </div>

          <div className="mt-10 rounded-2xl bg-surface-elevated/70 p-8 shadow-card hover:bg-surface-elevated/90 transition-colors">
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
    </AppLayout>
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
    <div className="rounded-xl bg-surface-elevated p-5 shadow-card hover:bg-surface-elevated/95 transition-colors">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight text-gradient">{value}</p>
    </div>
  );
}

function ComingSoonCard({
  icon: Icon,
  title,
  body,
  accentColor = "from-blue-500 to-cyan-500",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  accentColor?: string;
}) {
  return (
    <div className={`rounded-xl bg-surface-elevated/70 p-6 shadow-card backdrop-blur-sm overflow-hidden relative group hover:bg-surface-elevated/90 transition-all duration-200 hover:shadow-lg`}>
      <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accentColor}`} />
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
      <div className="relative z-10">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 text-primary-glow group-hover:bg-primary/30 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
        <span className="mt-4 inline-block text-[10px] uppercase tracking-widest text-primary-glow">
          Coming next
        </span>
      </div>
    </div>
  );
}
