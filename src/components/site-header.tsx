import { Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Scale className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">PNG Legal AI</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
          <a href="#use-cases" className="hover:text-foreground transition-colors">Use cases</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 shadow-glow">
                <Link to="/signup">Request access</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
