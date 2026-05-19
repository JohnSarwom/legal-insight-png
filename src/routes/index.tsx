import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileSearch,
  Quote,
  ShieldCheck,
  Sparkles,
  Network,
  FileText,
  Gavel,
  Database,
  Lock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PNG Legal AI — Document intelligence for Papua New Guinea law" },
      {
        name: "description",
        content:
          "AI-powered legal research grounded in PNG law. Upload statutes, judgments, and policies — get cited, verifiable answers in seconds.",
      },
      { property: "og:title", content: "PNG Legal AI — Document intelligence for PNG law" },
      {
        property: "og:description",
        content:
          "Retrieval-augmented legal research with verifiable citations. Built for lawyers, researchers, and compliance teams in Papua New Guinea.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Logos />
        <Features />
        <Workflow />
        <UseCases />
        <Security />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_30%,transparent_75%)]" />
      <div className="container relative mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-glow opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          New · Built for PNG statutes, judgments &amp; regulatory frameworks
        </div>

        <h1 className="mt-8 font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
          <span className="text-gradient">Legal research,</span>
          <br />
          <span className="text-gradient-primary italic">grounded in evidence.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          The AI workspace for Papua New Guinean lawyers, in-house counsel, and policy
          researchers. Upload statutes, judgments, contracts &amp; policies — ask anything,
          get cited answers with page-level references.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-glow gap-2 h-12 px-6">
            <Link to="/signup">
              Request early access <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 border-border/80">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Trusted handling · SOC-style audit trails · Your documents stay yours
        </p>

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-20 max-w-5xl">
      <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-tr from-primary/20 via-primary-glow/10 to-transparent blur-3xl" />
      <div className="relative rounded-2xl border border-border/80 bg-surface shadow-elevated overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          <span className="ml-3 font-mono text-[11px] text-muted-foreground">
            png-legal-ai · employment-law-kb
          </span>
        </div>
        <div className="grid grid-cols-12 min-h-[420px] text-left">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-border/60 p-4 space-y-1.5 hidden md:block">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-2">
              Knowledge bases
            </p>
            {[
              ["Employment Act 1978", true],
              ["Supreme Court 2023", false],
              ["Procurement Policy", false],
              ["PNG Constitution", false],
              ["Internal HR policies", false],
            ].map(([name, active]) => (
              <div
                key={name as string}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-surface-elevated"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                {name as string}
              </div>
            ))}
          </div>

          {/* Chat */}
          <div className="col-span-12 md:col-span-9 p-6 space-y-5">
            <div className="flex justify-end">
              <div className="max-w-md rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/20 px-4 py-2.5 text-sm">
                What are the statutory notice periods for terminating a permanent employee
                under PNG employment law?
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <Sparkles className="h-3 w-3 text-primary-glow" />
                Retrieved 4 passages from <span className="text-foreground">Employment Act 1978</span>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-surface-elevated border border-border/60 px-4 py-3.5 text-sm leading-relaxed">
                Under <span className="text-foreground font-medium">Section 34 of the Employment Act 1978</span>,
                notice for permanent employees scales with length of continuous service:
                <ul className="mt-2 space-y-1 text-muted-foreground pl-1">
                  <li>· Less than 4 weeks of service — 1 day</li>
                  <li>· 4 weeks to 1 year — 1 week</li>
                  <li>· 1 year to 5 years — 2 weeks</li>
                  <li>· Over 5 years — 4 weeks</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Citation>Employment Act 1978 · §34 · p.13</Citation>
                  <Citation>Employment Act 1978 · §36 · p.14</Citation>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Citation({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary-glow">
      <Quote className="h-2.5 w-2.5" />
      {children}
    </span>
  );
}

function Logos() {
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="container mx-auto px-6 py-10">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Designed for the workflows of
        </p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4 text-center text-sm text-muted-foreground/80">
          <span>Private Practice</span>
          <span>In-House Counsel</span>
          <span>Government &amp; Regulators</span>
          <span>Compliance Teams</span>
          <span>Legal Research</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: FileSearch,
      title: "Retrieval-augmented answers",
      body: "Every response is generated from your retrieved documents — never invented. Hallucinations are structurally prevented.",
    },
    {
      icon: Quote,
      title: "Page-level citations",
      body: "Section, page, and document for every claim. Click through to the exact source paragraph in seconds.",
    },
    {
      icon: Network,
      title: "Multi-document reasoning",
      body: "Compare a draft HR policy against the Employment Act, or cross-reference judgments across years and jurisdictions.",
    },
    {
      icon: FileText,
      title: "Native PDF, DOCX & OCR",
      body: "Scanned judgments and faxed contracts work the same as digital files. Vision-grade OCR built in.",
    },
    {
      icon: Gavel,
      title: "Contract analysis",
      body: "Surface risks, missing clauses, and unusual terms. Generate negotiation-ready summaries for any agreement.",
    },
    {
      icon: ShieldCheck,
      title: "Guardrails by design",
      body: "If the answer isn't in your knowledge base, the model says so. No fabricated citations. Ever.",
    },
  ];

  return (
    <section id="features" className="container mx-auto px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-primary-glow">Capabilities</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-gradient">
          Built for the way lawyers actually work.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          A focused legal AI stack — retrieval, citations, and reasoning — wrapped in an
          interface that respects your time and your professional standards.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
        {items.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-background p-7 hover:bg-surface transition-colors group"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 border border-primary/20 text-primary-glow group-hover:shadow-glow transition-shadow">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    {
      n: "01",
      title: "Upload or import",
      body: "Drag in PDFs, DOCX, scanned judgments, or paste PACLII URLs. Files are OCR'd, chunked, and indexed.",
    },
    {
      n: "02",
      title: "Organize knowledge bases",
      body: "Group documents by matter, jurisdiction, or practice area. Share with your team or keep private.",
    },
    {
      n: "03",
      title: "Ask. Cite. Decide.",
      body: "Ask natural questions. Get grounded answers with page-level citations you can verify in one click.",
    },
  ];

  return (
    <section id="workflow" className="container mx-auto px-6 py-24">
      <div className="grid md:grid-cols-3 gap-8 md:gap-4">
        {steps.map((s) => (
          <div key={s.n} className="relative pl-6 border-l border-border/80">
            <span className="absolute -left-px top-0 h-8 w-px bg-gradient-to-b from-primary to-transparent" />
            <p className="font-mono text-xs text-primary-glow">{s.n}</p>
            <h3 className="mt-3 font-display text-2xl tracking-tight">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    "Drafting compliance memos against the Securities Act",
    "Comparing internal HR policies with the Employment Act 1978",
    "Researching Supreme Court judgments on constitutional questions",
    "Reviewing procurement contracts for missing clauses",
    "Building a private knowledge base of ministerial directives",
    "Synthesizing case law for litigation strategy",
  ];
  return (
    <section id="use-cases" className="container mx-auto px-6 py-24">
      <p className="text-xs uppercase tracking-[0.25em] text-primary-glow">Use cases</p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-gradient max-w-2xl">
        From statutory interpretation to contract review.
      </h2>
      <div className="mt-12 grid sm:grid-cols-2 gap-3">
        {cases.map((c) => (
          <div
            key={c}
            className="rounded-xl border border-border/60 bg-surface/50 px-5 py-4 text-sm flex items-start gap-3"
          >
            <Zap className="h-4 w-4 mt-0.5 shrink-0 text-primary-glow" />
            <span>{c}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="container mx-auto px-6 py-24">
      <div className="rounded-3xl border border-border/80 bg-surface shadow-card p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-glow">Security</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-gradient">
            Your documents stay yours.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Role-based access control, encrypted storage, full audit trails, and tenant
            isolation. Your knowledge base is never used to train shared models.
          </p>
        </div>
        <ul className="space-y-4">
          {[
            { icon: Lock, t: "Encrypted at rest and in transit" },
            { icon: ShieldCheck, t: "Granular RBAC — Admin, Lawyer, Researcher, Client" },
            { icon: Database, t: "Per-workspace data isolation" },
            { icon: FileSearch, t: "Complete audit log of every query and document" },
          ].map(({ icon: Icon, t }) => (
            <li key={t} className="flex items-start gap-3 text-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20 text-primary-glow">
                <Icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/20 via-surface to-surface p-12 md:p-20 text-center shadow-elevated">
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_30%,transparent_75%)]" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-6xl tracking-tight text-gradient">
            Bring AI to your legal practice.
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-muted-foreground">
            Join PNG firms and in-house teams building the next generation of legal
            research. Early access is open.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-glow gap-2 h-12 px-6">
              <Link to="/signup">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
