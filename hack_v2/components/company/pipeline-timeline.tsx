"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Stage {
  key: string;
  name: string;
  agent: string;
  icon: string;
}

interface PipelineTimelineProps {
  isDiscovering: boolean;
  discoveryResult: any | null;
}

export function PipelineTimeline({ isDiscovering, discoveryResult }: PipelineTimelineProps) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  const stages: Stage[] = [
    { key: "website_agent", name: "Website Agent", agent: "Firecrawl", icon: "🌐" },
    { key: "news_agent", name: "News Agent", agent: "NewsAPI", icon: "📰" },
    { key: "contact_agent", name: "Contact Agent", agent: "Hunter", icon: "👥" },
    { key: "ai_agent", name: "AI Agent", agent: "Groq", icon: "🧠" },
    { key: "database", name: "Database", agent: "SQLite", icon: "💾" },
  ];

  // Simulating active stage index transitions when discovering is running
  useEffect(() => {
    if (!isDiscovering) {
      setActiveStageIdx(0);
      return;
    }

    const stageTimer = setInterval(() => {
      setActiveStageIdx(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000); // simulated transition sequence for demo

    return () => {
      clearInterval(stageTimer);
    };
  }, [isDiscovering]);

  const getStageStatus = (stage: Stage, index: number) => {
    if (discoveryResult) {
      const exec = discoveryResult.pipeline_execution?.[stage.key];
      return exec?.status || "completed";
    }

    if (!isDiscovering) {
      return "pending";
    }

    if (index === activeStageIdx) {
      return "running";
    }
    if (index < activeStageIdx) {
      return "completed";
    }
    return "pending";
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-primary/10 text-primary border-primary/20 animate-pulse";
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "skipped":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary/40 text-muted-foreground border-border";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Multi-Agent Pipeline</h3>
        <p className="text-xs text-muted-foreground">Execution status of active agents</p>
      </div>

      <div className="relative border-l border-border pl-6 ml-3 space-y-6">
        {stages.map((stage, idx) => {
          const status = getStageStatus(stage, idx);
          
          return (
            <div key={idx} className="relative">
              {/* Dot Icon Indicator */}
              <span className={`absolute -left-[37px] top-0 flex h-7 w-7 items-center justify-center rounded-full border text-xs bg-background ${
                status === "running" ? "border-primary shadow-sm" : "border-border"
              }`}>
                {status === "completed" ? "✓" : stage.icon}
              </span>
              
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{stage.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{stage.agent}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getBadgeColor(status)}`}>
                    {status}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
