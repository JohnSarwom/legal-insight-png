import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  MessagesSquare,
  Library,
  Search,
  Upload,
  Sparkles,
  Scale,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const display =
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Counsel";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header with Toggle */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/60 bg-surface/30 backdrop-blur-sm flex items-center px-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-surface/60 text-foreground transition-colors"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Main Flex Container */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-60 border-r border-border/60 bg-surface/50 p-5 flex flex-col transition-transform duration-300 ease-in-out top-16 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
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
          <NavItem icon={Sparkles} label="Overview" to="/dashboard" />
          <NavItem icon={MessagesSquare} label="AI Chat" to="/chat" />
          <NavItem icon={Library} label="Knowledge" to="/knowledge" />
          <NavItem icon={Upload} label="Upload center" to="/knowledge" />
          <NavItem icon={Search} label="Search" soon />
          <NavItem icon={FileText} label="Documents" to="/knowledge" />
        </nav>

        <div className="rounded-lg border border-border/60 bg-surface-elevated p-3 text-xs">
          <p className="font-medium truncate">{display}</p>
          <p className="text-muted-foreground truncate">{user?.email}</p>
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

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "ml-60" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  soon,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  soon?: boolean;
  to?: string;
}) {
  const inner = (
    <div
      className={`flex items-center justify-between rounded-md px-3 py-2 ${
        to ? "cursor-pointer text-muted-foreground hover:bg-surface-elevated hover:text-foreground" : ""
      }`}
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
      <Link to={to} className="block" activeProps={{ className: "bg-primary/15 text-foreground rounded-md" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}
