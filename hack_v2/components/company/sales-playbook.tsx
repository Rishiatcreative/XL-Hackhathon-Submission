"use client";

import React, { useState } from "react";
import { Company } from "@/types/company";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Mail,
  Copy,
  Check,
  FileDown,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Users,
  Award
} from "lucide-react";

interface SalesPlaybookProps {
  company: Company;
}

export function SalesPlaybook({ company }: SalesPlaybookProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // Collapse state for each individual playbook card category
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    priority: false,
    signals: false,
    evidence: false,
    contacts: false,
    email: false,
    nextAction: false
  });

  const playbook = company.sales_playbook || {
    lead_priority: "Medium",
    why_qualified: "Information unavailable.",
    buying_signals: "Information unavailable.",
    supporting_evidence: "Information unavailable.",
    recommended_decision_makers: "Information unavailable.",
    outreach_strategy: "Information unavailable.",
    communication_channel: "Email",
    followup_timeline: "1 week",
    subject_line: "Information unavailable.",
    cold_email_opening: "Information unavailable.",
    next_best_action: "Information unavailable.",
  };

  const decisionMaker = company.contacts && company.contacts.length > 0 
    ? company.contacts[0].name 
    : "[Decision Maker Name]";

  const emailBody = `Subject: ${playbook.subject_line || "Outreach"}

Hi ${decisionMaker},

${playbook.cold_email_opening || "I hope this email finds you well."}

I noticed ${company.company} recently experienced a ${company.trigger || "growth phase"}. Based on our analysis, we believe we can help you accelerate your next steps and drive optimal outcomes.

Would you be open to a brief, 10-minute introduction call next week?

Best regards,
[Your Name]`;

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copySummaryToClipboard = () => {
    navigator.clipboard.writeText(company.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exportToCSV = () => {
    const headers = ["Attribute", "Value"];
    const rows = [
      ["Company Name", company.company],
      ["Website", company.website],
      ["Industry", company.industry],
      ["Employees", company.employees || "Unknown"],
      ["Trigger Event", company.trigger],
      ["ICP Score", company.score],
      ["Discovery Timestamp", company.discovery_timestamp || ""],
      ["Lead Priority", playbook.lead_priority || ""],
      ["Why Qualified", playbook.why_qualified || ""],
      ["Buying Signals", playbook.buying_signals || ""],
      ["Next Best Action", playbook.next_best_action || ""],
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${company.company.replace(/\s+/g, "_")}_prospect_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const content = `
      <html>
        <head>
          <title>Sales Playbook — ${company.company}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            h1 { border-bottom: 2px solid #6366f1; padding-bottom: 10px; font-size: 28px; color: #4338ca; }
            h2 { font-size: 18px; color: #1e1b4b; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
            .priority-high { background-color: #fee2e2; color: #991b1b; }
            .priority-medium { background-color: #fef3c7; color: #92400e; }
            .priority-low { background-color: #d1fae5; color: #065f46; }
            .email-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; font-family: monospace; white-space: pre-wrap; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>AI Sales Playbook for ${company.company}</h1>
          <p><strong>Website:</strong> ${company.website} | <strong>Industry:</strong> ${company.industry}</p>
          <p><strong>ICP Fit Score:</strong> ${company.score}/100</p>
          
          <h2>Lead Priority</h2>
          <span class="priority priority-${(playbook.lead_priority || "medium").toLowerCase()}">${playbook.lead_priority || "Medium"}</span>
          
          <h2>Why Qualified</h2>
          <p>${playbook.why_qualified || "Information unavailable."}</p>
          
          <h2>Buying Signals & Evidence</h2>
          <p><strong>Signals:</strong> ${playbook.buying_signals || "Information unavailable."}</p>
          <p><strong>Evidence:</strong> ${playbook.supporting_evidence || "Information unavailable."}</p>
          
          <h2>Recommended Outreach</h2>
          <p><strong>Strategy:</strong> ${playbook.outreach_strategy || "Information unavailable."}</p>
          <p><strong>Channel:</strong> ${playbook.communication_channel || "Email"}</p>
          <p><strong>Follow-up Timeline:</strong> ${playbook.followup_timeline || "3 days"}</p>
          <p><strong>Next Best Action:</strong> ${playbook.next_best_action || "Information unavailable."}</p>
          
          <h2>Personalized Outreach Template</h2>
          <div class="email-box">Subject: ${playbook.subject_line || "Reaching out"}\n\nHi ${decisionMaker},\n\n${playbook.cold_email_opening || "I hope you are doing well."}\n\nI noticed that ${company.company} recently had a ${company.trigger} event. Based on our analysis, we believe we can help you accelerate your efforts in this area.\n\nWould you be open to a brief chat next week?\n\nBest regards,\n[Your Name]</div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const getPriorityColor = (p: string) => {
    switch (p.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "low":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const renderLines = (val: any) => {
    if (!val) return "Information unavailable.";
    let lines: string[] = [];
    if (Array.isArray(val)) {
      lines = val;
    } else if (typeof val === "string") {
      lines = val.split("\n");
    } else {
      return String(val);
    }
    return lines.filter(Boolean).map((line, i) => (
      <p key={i} className="text-slate-600 dark:text-slate-350">{line.replace(/^-\s*/, "")}</p>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">Lead Priority:</span>
          <Badge variant="outline" className={`px-2.5 py-1 text-xs font-semibold ${getPriorityColor(playbook.lead_priority || "Medium")}`}>
            {playbook.lead_priority || "Medium"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copySummaryToClipboard} className="text-xs h-8 border border-border bg-background hover:bg-muted font-bold cursor-pointer">
            {copiedSummary ? "Copied!" : "Copy Summary"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="text-xs h-8 border border-border bg-background hover:bg-muted font-bold cursor-pointer">
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF} className="text-xs h-8 border border-border bg-background hover:bg-muted font-bold cursor-pointer">
            <FileDown className="mr-1 h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Individual Collapsible Playbook Cards */}
      <div className="space-y-4">
        {/* Card 1: Fit & Why Qualified */}
        <Card className="border border-border bg-card shadow-xs overflow-hidden">
          <div
            onClick={() => toggleCollapse("priority")}
            className="flex items-center justify-between p-4 bg-muted/10 border-b border-border/40 cursor-pointer select-none"
          >
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-500" />
              <span>Lead Qualification</span>
            </h4>
            {collapsed.priority ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
          </div>
          {!collapsed.priority && (
            <CardContent className="p-4 text-xs leading-relaxed">
              <strong className="text-foreground block mb-1">Why Qualified:</strong>
              <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                {renderLines(playbook.why_qualified)}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Card 2: Buying Signals */}
        <Card className="border border-border bg-card shadow-xs overflow-hidden">
          <div
            onClick={() => toggleCollapse("signals")}
            className="flex items-center justify-between p-4 bg-muted/10 border-b border-border/40 cursor-pointer select-none"
          >
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span>Buying Signals</span>
            </h4>
            {collapsed.signals ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
          </div>
          {!collapsed.signals && (
            <CardContent className="p-4 text-xs leading-relaxed">
              <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                {renderLines(playbook.buying_signals)}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Card 3: Supporting Evidence */}
        {playbook.supporting_evidence && (
          <Card className="border border-border bg-card shadow-xs overflow-hidden">
            <div
              onClick={() => toggleCollapse("evidence")}
              className="flex items-center justify-between p-4 bg-muted/10 border-b border-border/40 cursor-pointer select-none"
            >
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-500" />
                <span>Supporting Evidence</span>
              </h4>
              {collapsed.evidence ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
            </div>
            {!collapsed.evidence && (
              <CardContent className="p-4 text-xs leading-relaxed">
                <div className="pl-4 border-l-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-1">
                  {renderLines(playbook.supporting_evidence)}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Card 4: Recommended Decision Makers */}
        <Card className="border border-border bg-card shadow-xs overflow-hidden">
          <div
            onClick={() => toggleCollapse("contacts")}
            className="flex items-center justify-between p-4 bg-muted/10 border-b border-border/40 cursor-pointer select-none"
          >
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <span>Recommended Contacts</span>
            </h4>
            {collapsed.contacts ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
          </div>
          {!collapsed.contacts && (
            <CardContent className="p-4 text-xs leading-relaxed space-y-3">
              <div>
                <strong className="text-foreground block mb-1">Recommended Profiles:</strong>
                <p className="text-slate-600 dark:text-slate-350">{playbook.recommended_decision_makers || "Information unavailable."}</p>
              </div>
              <div>
                <strong className="text-foreground block mb-1">Target Strategy:</strong>
                <p className="text-slate-600 dark:text-slate-350">{playbook.outreach_strategy || "Information unavailable."}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Card 5: Email outreach template preview */}
        <Card className="border border-border bg-card shadow-xs overflow-hidden">
          <div
            onClick={() => toggleCollapse("email")}
            className="flex items-center justify-between p-4 bg-muted/10 border-b border-border/40 cursor-pointer select-none"
          >
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-500" />
              <span>Suggested Email Draft</span>
            </h4>
            {collapsed.email ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
          </div>
          {!collapsed.email && (
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Subject: {playbook.subject_line || "Outreach"}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyEmailToClipboard}
                  className="h-7 text-[10px] gap-1 px-2 hover:bg-muted text-indigo-500 cursor-pointer font-bold"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedEmail ? "Copied Email!" : "Copy Template"}</span>
                </Button>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-border p-3.5 rounded-lg font-mono whitespace-pre-wrap leading-normal">
                {emailBody}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Card 6: Next Best Action */}
        <Card className="border border-border bg-card shadow-xs overflow-hidden">
          <div
            onClick={() => toggleCollapse("nextAction")}
            className="flex items-center justify-between p-4 bg-muted/10 border-b border-border/40 cursor-pointer select-none"
          >
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              <span>Next Best Action</span>
            </h4>
            {collapsed.nextAction ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
          </div>
          {!collapsed.nextAction && (
            <CardContent className="p-4 text-xs leading-relaxed">
              <p className="text-foreground font-extrabold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-indigo-500 animate-pulse" />
                <span>{playbook.next_best_action || "Information unavailable."}</span>
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
