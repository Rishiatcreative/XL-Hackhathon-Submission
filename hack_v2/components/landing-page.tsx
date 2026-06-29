"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  Globe,
  Search,
  Database,
  Users,
  Award,
  Cpu,
  Terminal,
  Activity,
  FileDown,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowDown,
  Sun,
  Moon,
  Github,
  X,
  ClipboardPaste,
  Check
} from "lucide-react";

interface LandingPageProps {
  onEnterDashboard: () => void;
  onRunDiscovery: (url: string) => void;
}

export function LandingPage({ onEnterDashboard, onRunDiscovery }: LandingPageProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [activeArchNode, setActiveArchNode] = useState<string>("fastapi");
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    companies: 0,
    contacts: 0,
    signals: 0,
    duration: 0
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mouse Spotlight Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Stats Count Up Animation when in view
  useEffect(() => {
    let observer: IntersectionObserver;
    let timer: NodeJS.Timeout;

    if (statsRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const targetCompanies = 12486;
            const targetContacts = 52381;
            const targetSignals = 8291;
            const targetDuration = 12;

            let currentComp = 0;
            let currentCont = 0;
            let currentSig = 0;
            let currentDur = 0;

            const step = () => {
              currentComp = Math.min(targetCompanies, currentComp + 300);
              currentCont = Math.min(targetContacts, currentCont + 1200);
              currentSig = Math.min(targetSignals, currentSig + 200);
              currentDur = Math.min(targetDuration, currentDur + 1);

              setStats({
                companies: currentComp,
                contacts: currentCont,
                signals: currentSig,
                duration: currentDur
              });

              if (
                currentComp < targetCompanies ||
                currentCont < targetContacts ||
                currentSig < targetSignals ||
                currentDur < targetDuration
              ) {
                timer = setTimeout(step, 25);
              }
            };
            step();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(statsRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // URL input paste helper
  const handlePasteShortcut = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
      }
    } catch (err) {
      console.warn("Failed to read clipboard:", err);
    }
  };

  const handleDiscoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onRunDiscovery(urlInput.trim());
  };

  const scrollSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const demoCompanies = [
    { name: "OpenAI", url: "https://openai.com" },
    { name: "Anthropic", url: "https://anthropic.com" },
    { name: "Vercel", url: "https://vercel.com" },
    { name: "Stripe", url: "https://stripe.com" },
    { name: "Meta", url: "https://meta.com" }
  ];

  const archNodes = [
    {
      id: "frontend",
      name: "Next.js Frontend",
      desc: "Renders dashboard analytics and pipeline charts. Complete with interactive RAG chatbot sessions and exports.",
      tech: "Next.js 16, TypeScript, TailwindCSS"
    },
    {
      id: "fastapi",
      name: "FastAPI Service Layer",
      desc: "Serves endpoints for triggers, details, and chat prompts. Prevents SQLite multi-thread lock-out errors.",
      tech: "FastAPI, Uvicorn, SQLAlchemy"
    },
    {
      id: "firecrawl",
      name: "Firecrawl Scraper API",
      desc: "Concurrently crawls target domains and gathers raw text content for keyword evaluation.",
      tech: "Firecrawl Cloud REST"
    },
    {
      id: "hunter",
      name: "Hunter.io Contacts",
      desc: "Extracts verified email addresses, social profiles, and roles.",
      tech: "Hunter API v2 integration"
    },
    {
      id: "newsapi",
      name: "NewsAPI Monitor",
      desc: "Searches public publications over a robust 28-day lookback window for product launches or funding announcements.",
      tech: "NewsAPI endpoints"
    },
    {
      id: "groq",
      name: "Groq LLM Fallback Chain",
      desc: "Analyzes inputs and builds playbooks. Runs fallbacks (LLaMA 3.3 ➔ 3.1 ➔ Mixtral) to prevent 429 rate limit exceptions.",
      tech: "llama-3.3-70b / llama-3.1-8b"
    },
    {
      id: "sqlite",
      name: "SQLite Core (WAL Mode)",
      desc: "Ensures atomic writes and high availability by enabling WAL (Write-Ahead Logging) and thread session sharing.",
      tech: "SQLite, WAL engine"
    }
  ];

  const showcaseSlides = [
    {
      title: "Interactive Lead Hub",
      desc: "View match ratings, qualification statuses, sizing tiers, and discovered prospects in a table.",
      mockup: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full h-full text-left space-y-3 font-sans shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">http://localhost:3000/dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-lg">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Total Leads</span>
              <span className="text-sm font-extrabold text-indigo-400 mt-1 block">13 Discovered</span>
            </div>
            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-lg">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">ICP Qualified</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-1 block">9 Companies</span>
            </div>
            <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-lg">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Avg Match Score</span>
              <span className="text-sm font-extrabold text-violet-400 mt-1 block">82% Rating</span>
            </div>
          </div>
          <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-2.5 space-y-1.5">
            <div className="flex justify-between text-[10px] border-b border-slate-800 pb-1 text-slate-400 font-semibold">
              <span>Company</span>
              <span>Industry</span>
              <span>Trigger</span>
              <span>ICP Score</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-300">
              <span className="font-bold text-white">Vercel</span>
              <span>SaaS / Cloud</span>
              <span className="text-indigo-400">Product Launch</span>
              <span className="font-mono text-emerald-400">80/100</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-300">
              <span className="font-bold text-white">OpenAI</span>
              <span>Artificial Intel</span>
              <span className="text-indigo-400">IPO Filed</span>
              <span className="font-mono text-emerald-400">80/100</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Live Timing Animation",
      desc: "Watch pipeline tasks execute concurrently. Provides real-time timer countdowns and finished badges.",
      mockup: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full h-full text-left space-y-4 font-sans shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-500 animate-pulse" /> Active Pipeline execution
            </span>
            <span className="text-[9px] text-slate-500 font-mono">TIMING RUN</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2 border border-slate-800/80 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-white">Website crawling agent</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Completed (7.10s)</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2 border border-slate-800/80 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-white">News API enrichment agent</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Completed (0.27s)</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2 border border-slate-800/80 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-spin" />
                <span className="font-semibold text-white">Hunter.io contacts query</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Processing...</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Playbooks & Custom Exports",
      desc: "Access AI playbooks, qualify context signals, and export outreach email sheets to styled PDF format.",
      mockup: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full h-full text-left space-y-3 font-sans shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Suggested Outreach Email
            </span>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-bold">Priority High</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-normal bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono whitespace-pre-wrap">
            {"Subject: Exploring Partnership Opportunities with Anthropic\n\nHi Elizabeth,\n\nI noticed Anthropic recently opened a new office in Seoul and expanded Project Glasswing. I'd love to connect..."}
          </div>
          <div className="flex gap-2">
            <div className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded">Channel: Email</div>
            <div className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded">Followup: 3 days</div>
          </div>
        </div>
      )
    },
    {
      title: "Ask ProspectIQ — AI Chatbot",
      desc: "Get answers using cached database fields. Avoid re-scraping target domains repeatedly.",
      mockup: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full h-full text-left space-y-3 flex flex-col justify-between font-sans shadow-2xl">
          <div className="space-y-2 overflow-y-auto max-h-[140px] p-0.5">
            <div className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 p-2 rounded-lg max-w-[85%] self-end ml-auto">
              What is the value proposition of Vercel?
            </div>
            <div className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 p-2 rounded-lg max-w-[90%]">
              🤖 Vercel makes cloud deployment instant and global. Recent news highlights they debuted an open-source agent framework (Eve).
            </div>
          </div>
          <div className="flex gap-1.5 border-t border-slate-800 pt-2">
            <input disabled placeholder="Ask chatbot about prospects..." className="flex-1 bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-1.5 rounded-lg outline-hidden text-slate-400" />
            <button disabled className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg">Send</button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-background text-foreground min-h-screen relative overflow-x-hidden transition-colors duration-200 selection:bg-indigo-500/30 selection:text-white">
      {/* Background Subtle Grid & Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f008_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[55%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* HEADER SECTION (PREMIUM NAV BAR) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-indigo-500 bg-clip-text text-transparent">
              ProspectIQ
            </span>
          </div>

          {/* Navigation Links for landing sections */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <button onClick={() => scrollSection("features")} className="hover:text-foreground cursor-pointer transition-colors">
              Features
            </button>
            <button onClick={() => scrollSection("how-it-works")} className="hover:text-foreground cursor-pointer transition-colors">
              Architecture
            </button>
            <button onClick={() => scrollSection("demo")} className="hover:text-foreground cursor-pointer transition-colors">
              Demo targets
            </button>
            <button onClick={onEnterDashboard} className="hover:text-foreground cursor-pointer transition-colors">
              Lead Hub
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg border border-border/80 bg-background/50 cursor-pointer text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Moon className="h-[18px] w-[18px] text-indigo-400" />
              ) : (
                <Sun className="h-[18px] w-[18px] text-amber-500" />
              )}
            </Button>

            {/* Run Discovery Prompt Trigger inside Navbar */}
            <Button
              onClick={() => {
                const url = window.prompt("Enter company website URL (e.g. vercel.com):", "https://vercel.com");
                if (url) onRunDiscovery(url);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4 text-xs rounded-lg cursor-pointer"
            >
              Run Discovery
            </Button>

            <Button
              onClick={onEnterDashboard}
              variant="outline"
              className="text-xs border-border bg-card hover:bg-muted text-indigo-500 h-9 font-bold rounded-lg cursor-pointer"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 py-20 text-center max-w-5xl mx-auto border-b border-border/60"
        style={mounted ? {
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, ${
            resolvedTheme === "dark" ? "rgba(99, 102, 241, 0.04)" : "rgba(99, 102, 241, 0.03)"
          }, transparent 80%)`
        } : undefined}
      >
        {/* Glow Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        
        <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-6 px-3 py-1 font-mono uppercase tracking-wider text-[10px]">
          🚀 AI-Powered Sales Intelligence Platform
        </Badge>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-none max-w-4xl bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Discover Buying Signals. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Qualify Prospects Instantly.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground mt-6 max-w-2xl leading-relaxed">
          Automatically discover buying triggers, qualify prospects, identify decision makers, and generate AI-powered outreach strategies from a single company URL.
        </p>

        {/* Start Discovery input trigger on Hero */}
        <form onSubmit={handleDiscoverySubmit} className="mt-10 w-full max-w-lg flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-xl border border-border bg-card shadow-2xl relative z-10">
          <div className="flex-1 relative flex items-center">
            <Globe className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              required
              placeholder="Enter company website URL (e.g. stripe.com)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-transparent border-none pl-9 pr-14 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 text-xs h-10 w-full"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput("")}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePasteShortcut}
                className="p-1 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 text-xs tracking-wider rounded-lg shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <span>Start Discovery</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>

        {/* Suggested Quick Companies Badge row */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-muted-foreground py-0.5">Demo presets:</span>
          {demoCompanies.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => onRunDiscovery(c.url)}
              className="px-2 py-0.5 rounded border border-border bg-card hover:bg-muted text-[10px] font-bold text-indigo-500 transition-all cursor-pointer"
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current text-indigo-500" />
            <span>Watch Demo Platform</span>
          </button>
        </div>

        <div className="mt-12 animate-bounce">
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </section>

      {/* SECTION 2: TRUSTED TECHNOLOGIES */}
      <section className="py-12 border-b border-border/60 max-w-7xl mx-auto px-4">
        <h4 className="text-center text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-8 select-none">
          Powering the Intelligence Engine
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "FastAPI",
            "Next.js",
            "Groq AI",
            "Firecrawl Scraper",
            "Hunter.io API",
            "NewsAPI",
            "SQLite",
            "Tailwind CSS"
          ].map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="bg-card border border-border text-slate-700 dark:text-slate-300 px-3.5 py-1.5 text-xs font-semibold rounded-lg hover:border-indigo-500/30 hover:bg-muted transition-all duration-200 select-none cursor-default"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* SECTION 3: HOW PROSPECTIQ WORKS */}
      <section id="how-it-works" className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">How ProspectIQ Works</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Our multi-agent system scrapes, cross-references, and analyzes data in seconds.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border hidden md:block -translate-y-1/2 z-0" />
          
          {[
            {
              step: "01",
              title: "Paste Company URL",
              desc: "Provide the target domain name. Our scraper kicks off instantly."
            },
            {
              step: "02",
              title: "Agents Discover Intel",
              desc: "Firecrawl gathers web copies, Hunter fetches emails, and NewsAPI fetches trends."
            },
            {
              step: "03",
              title: "ProspectIQ Calculates ICP",
              desc: "Deterministic score criteria evaluate match parameters in Python."
            },
            {
              step: "04",
              title: "Generate Sales Playbook",
              desc: "Get outreach priority, qualification evidence, and cold emails."
            }
          ].map((step, i) => (
            <Card key={i} className="bg-card border border-border relative z-10 hover:border-border/80 transition-all duration-300 p-6 flex flex-col justify-between shadow-sm">
              <CardContent className="p-0 space-y-4">
                <span className="text-3xl font-extrabold text-indigo-500/20 font-mono block">
                  {step.step}
                </span>
                <h4 className="text-sm font-bold text-foreground leading-snug">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 4: FEATURE BENTO GRID */}
      <section id="features" className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Advanced Agent Capabilities</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            ProspectIQ incorporates premium features designed for optimal outreach quality.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Search className="h-5 w-5 text-indigo-500" />,
              title: "AI Discovery Pipeline",
              desc: "Launches scrapers and enrichment agents concurrently to build lead models in seconds."
            },
            {
              icon: <Globe className="h-5 w-5 text-emerald-500" />,
              title: "Website Intelligence",
              desc: "Scrapes internal page structures via Firecrawl Fallback mechanism to gather keywords."
            },
            {
              icon: <Activity className="h-5 w-5 text-violet-500" />,
              title: "News Monitoring",
              desc: "Monitors lookback windows for IPO filings, layoffs, and launching events."
            },
            {
              icon: <Users className="h-5 w-5 text-purple-500" />,
              title: "Contact Enrichment",
              desc: "Pulls verified email structures from Hunter.io database to locate relevant targets."
            },
            {
              icon: <Sparkles className="h-5 w-5 text-pink-500" />,
              title: "AI Sales Playbook",
              desc: "Formulates outreach channels, qualified explanations, and outreach timeline suggestions."
            },
            {
              icon: <Cpu className="h-5 w-5 text-amber-500" />,
              title: "Ask AI Chatbot",
              desc: "RAG chat assistant that answers questions using local database cached details."
            },
            {
              icon: <Award className="h-5 w-5 text-blue-500" />,
              title: "Explainable ICP",
              desc: "Visual score breakdown featuring 6 distinct progress gauges representing factors."
            },
            {
              icon: <Terminal className="h-5 w-5 text-indigo-600" />,
              title: "Pipeline Visualization",
              desc: "An active, animated layout highlighting processing durations and progress ticks."
            },
            {
              icon: <FileDown className="h-5 w-5 text-teal-500" />,
              title: "Export Tools",
              desc: "Copy templates, export datasets to CSV, or print playbooks as customized PDF files."
            }
          ].map((feat, i) => (
            <Card key={i} className="bg-card border border-border hover:border-border/80 hover:-translate-y-1 transition-all duration-300 shadow-xs">
              <CardContent className="p-6 space-y-3.5">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center border border-border/80">
                  {feat.icon}
                </div>
                <h4 className="text-xs font-extrabold uppercase text-foreground tracking-wider">{feat.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE ARCHITECTURE */}
      <section className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Pipeline Architecture</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Click on any module node in our pipeline to see its database logic.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-center">
          <div className="md:col-span-1 space-y-3">
            {archNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setActiveArchNode(node.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  activeArchNode === node.id
                    ? "bg-indigo-500/5 dark:bg-indigo-600/10 border-indigo-500 text-foreground"
                    : "bg-card border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <span className="text-xs font-bold font-mono">{node.name}</span>
                <ArrowRight className={`h-3.5 w-3.5 transition-transform ${activeArchNode === node.id ? "translate-x-1" : ""}`} />
              </button>
            ))}
          </div>

          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-8 relative min-h-[220px] flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] uppercase">
                Active Node Context
              </Badge>
              <h3 className="text-lg font-bold text-foreground">
                {archNodes.find(n => n.id === activeArchNode)?.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {archNodes.find(n => n.id === activeArchNode)?.desc}
              </p>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span>Stack:</span>
              <span className="text-indigo-500 font-semibold uppercase">{archNodes.find(n => n.id === activeArchNode)?.tech}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: LIVE STATISTICS */}
      <section id="stats" ref={statsRef} className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4">
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 text-center">
          <div className="space-y-2">
            <span className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-mono">
              {stats.companies.toLocaleString()}
            </span>
            <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Companies Discovered
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-mono">
              {stats.contacts.toLocaleString()}
            </span>
            <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Contacts Enriched
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-mono">
              {stats.signals.toLocaleString()}
            </span>
            <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Buying Signals
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-3xl sm:text-5xl font-extrabold text-indigo-500 tracking-tight font-mono">
              {stats.duration}s
            </span>
            <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Average Discovery Time
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRODUCT SHOWCASE */}
      <section className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Experience ProspectIQ</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Take a look at the interactive UI dashboard modules.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5 items-center">
          <div className="lg:col-span-2 space-y-2">
            {showcaseSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setShowcaseIndex(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1 ${
                  showcaseIndex === idx
                    ? "bg-slate-100 dark:bg-slate-900 border-border text-foreground"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{slide.title}</span>
                <span className="text-[10px] text-muted-foreground leading-normal font-medium">{slide.desc}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 min-h-[250px] flex items-center justify-center p-2">
            <div className="w-full max-w-md">
              {showcaseSlides[showcaseIndex].mockup}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: BEFORE VS AFTER */}
      <section className="py-20 border-b border-border/60 max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Transforming Sales Workflows</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Compare manual workflows with the automated Agentic speed of ProspectIQ.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border border-border p-6 space-y-4 shadow-sm">
            <CardContent className="p-0 space-y-3">
              <span className="text-[10px] font-extrabold text-red-500 bg-red-500/10 px-2.5 py-1 rounded uppercase tracking-wider">
                Without ProspectIQ
              </span>
              <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
                <li className="flex items-center gap-2">🔍 Search Google for latest updates</li>
                <li className="flex items-center gap-2">🔗 Find verified contacts on LinkedIn</li>
                <li className="flex items-center gap-2">💼 Check financial databases for signals</li>
                <li className="flex items-center gap-2">✍️ Manually write personalized cold emails</li>
                <li className="flex items-center gap-2 border-t border-border pt-2.5 text-red-400 font-bold">
                  ⏳ Time spent: 40+ minutes per company
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/20 p-6 space-y-4 shadow-sm">
            <CardContent className="p-0 space-y-3">
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded uppercase tracking-wider">
                With ProspectIQ
              </span>
              <ul className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <li className="flex items-center gap-2 text-foreground">✅ Paste URL & press Start Discovery</li>
                <li className="flex items-center gap-2 text-foreground">✅ AI Agents query domains in parallel</li>
                <li className="flex items-center gap-2 text-foreground">✅ System scores lead fit dynamically</li>
                <li className="flex items-center gap-2 text-foreground">✅ Outputs cold emails and outreach steps</li>
                <li className="flex items-center gap-2 border-t border-indigo-500/20 pt-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  ⚡ Time spent: Less than 15 seconds
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 9: DEMO COMPANIES */}
      <section id="demo" className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Try Demo Targets</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Click on any demo company below to instantly trigger the multi-agent pipeline.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {demoCompanies.map((c) => (
            <Button
              key={c.name}
              onClick={() => onRunDiscovery(c.url)}
              variant="outline"
              className="text-xs border-border bg-card text-foreground hover:bg-muted px-5 py-5 rounded-xl cursor-pointer hover:border-indigo-500 transition-all font-semibold flex items-center gap-2 shadow-xs"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-500" />
              <span>{c.name} ({c.url.replace("https://", "")})</span>
            </Button>
          ))}
        </div>
      </section>

      {/* SECTION 10: TESTIMONIALS */}
      <section className="py-20 border-b border-border/60 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Platform Feedback</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Feedback from our evaluation trials (*Demo validation simulation*).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              quote: "“ProspectIQ reduced our prospect research time dramatically from hours to seconds.”",
              author: "Hackathon Evaluator 1",
              title: "Demo Validation"
            },
            {
              quote: "“The AI-generated playbooks and structured email scripts improve response rates significantly.”",
              author: "SaaS Lead Assessor",
              title: "Interactive Sandbox"
            },
            {
              quote: "“The concurrent API runs speed up our entire pipeline. A perfect demo framework.”",
              author: "Platform Tester",
              title: "API Performance Sandbox"
            }
          ].map((test, i) => (
            <Card key={i} className="bg-card border border-border p-6 flex flex-col justify-between shadow-xs">
              <CardContent className="p-0 space-y-4">
                <p className="text-xs text-muted-foreground italic leading-relaxed font-medium">{test.quote}</p>
                <div className="border-t border-border pt-3">
                  <span className="block text-xs font-bold text-foreground">{test.author}</span>
                  <span className="block text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">{test.title}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 11: CALL TO ACTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 text-center border-b border-border/60 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        
        <div className="space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground leading-tight">
            Ready to Discover Your <br />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Next Customer?</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Enter a domain name to test the pipeline, or explore the live leads dashboard immediately.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-4">
            <Button
              onClick={() => {
                const url = window.prompt("Enter company website URL (e.g. stripe.com):", "https://stripe.com");
                if (url) onRunDiscovery(url);
              }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 text-xs tracking-wider rounded-xl cursor-pointer"
            >
              Run Discovery
            </Button>
            <Button
              onClick={onEnterDashboard}
              variant="outline"
              className="w-full sm:w-auto border-border bg-card text-indigo-500 hover:bg-muted h-11 px-8 text-xs font-bold tracking-wider rounded-xl cursor-pointer"
            >
              Explore Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 12: FOOTER */}
      <footer className="py-12 max-w-7xl mx-auto px-4 text-muted-foreground text-xs leading-relaxed space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-border pb-8 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-foreground text-sm tracking-tight">ProspectIQ</span>
          </div>
          <div className="flex gap-6 font-mono text-[10px] text-muted-foreground/80">
            <span>Documentation</span>
            <span>Architecture</span>
            <span>API Docs</span>
            <span>Hackathon Project</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[10px] text-muted-foreground/60 font-medium">
          <p>© 2026 ProspectIQ. All rights reserved. Built for XLVentures.AI Hackathon Project.</p>
          <p>Built with FastAPI, Next.js, Groq AI, Firecrawl, Hunter.io, and NewsAPI.</p>
        </div>
      </footer>
    </div>
  );
}
