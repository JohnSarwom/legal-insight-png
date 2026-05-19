import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — PNG Legal AI" },
      { name: "description", content: "Sign in to your PNG Legal AI workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    }
  }

  async function onGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
    if (!res.redirected && !res.error) navigate({ to: "/dashboard" });
  }

  return <AuthShell title="Sign in" subtitle="Welcome back to your legal workspace.">
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@firm.com.pg" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 shadow-glow h-11">
        {loading ? "Signing in…" : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}
      </Button>
    </form>

    <Divider />

    <Button variant="outline" className="w-full h-11" onClick={onGoogle}>
      <GoogleIcon /> Continue with Google
    </Button>

    <p className="mt-6 text-center text-sm text-muted-foreground">
      Don't have an account?{" "}
      <Link to="/signup" className="text-primary-glow hover:text-primary underline-offset-4 hover:underline">
        Request access
      </Link>
    </p>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand pane */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-hero relative overflow-hidden border-r border-border/60">
        <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_40%,#000_30%,transparent_80%)]" />
        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Scale className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">PNG Legal AI</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Intelligence</span>
          </div>
        </Link>

        <div className="relative max-w-md">
          <p className="font-display text-4xl xl:text-5xl tracking-tight text-gradient leading-[1.05]">
            "Cited, verifiable answers in seconds — the way legal research should feel."
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Built for the PNG legal community · Statutes, judgments, regulations, contracts
          </p>
        </div>

        <div className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} PNG Legal AI
        </div>
      </div>

      {/* Form pane */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow">
              <Scale className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold">PNG Legal AI</span>
          </Link>
          <h1 className="font-display text-3xl tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.998 10.998 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.43.36-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
