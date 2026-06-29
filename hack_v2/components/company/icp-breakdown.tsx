import React from "react";

interface ICPBreakdownProps {
  score: number;
  breakdown?: {
    industry_match: number;
    company_size: number;
    buying_trigger: number;
    news_relevance: number;
    website_match: number;
    decision_makers_found: number;
  } | null;
}

export function ICPBreakdown({ score, breakdown }: ICPBreakdownProps) {
  // Safe fallbacks
  const data = breakdown || {
    industry_match: 30,
    company_size: 30,
    buying_trigger: 0,
    news_relevance: 20,
    website_match: 70,
    decision_makers_found: 20,
  };

  const categories = [
    { label: "Industry Match", value: data.industry_match, color: "from-blue-500 to-indigo-600" },
    { label: "Company Size", value: data.company_size, color: "from-purple-500 to-pink-600" },
    { label: "Buying Trigger", value: data.buying_trigger, color: "from-amber-500 to-orange-600" },
    { label: "News Relevance", value: data.news_relevance, color: "from-emerald-500 to-teal-600" },
    { label: "Website Match", value: data.website_match, color: "from-cyan-500 to-blue-600" },
    { label: "Decision Makers Available", value: data.decision_makers_found, color: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">ICP Fit Breakdown</h3>
          <p className="text-xs text-muted-foreground">Deterministic criteria match scoring</p>
        </div>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
          <div className="text-center">
            <span className="text-2xl font-extrabold text-primary">{score}</span>
            <span className="block text-[8px] font-medium text-muted-foreground uppercase">Overall</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">{cat.label}</span>
              <span className="text-foreground">{cat.value}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-1000 ease-out`}
                style={{ width: `${cat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
