export interface Contact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  linkedin: string | null;
  source?: string;
}

export interface Company {
  id: string;
  company: string;
  website: string;
  industry: string;
  employees: number | null;
  trigger: string;
  score: number;
  summary: string;
  contacts: Contact[];
  qualified?: boolean;
  trigger_source?: string | null;
  trigger_confidence?: number | null;
  contact_confidence?: number | null;
  summary_confidence?: number | null;
  status?: string | null;
  created_at?: string | null;
  firecrawl_used?: boolean;
  news_used?: boolean;
  news_headlines?: string | null;
  discovery_timestamp?: string | null;
  sales_playbook?: {
    lead_priority?: string;
    why_qualified?: string;
    buying_signals?: string;
    supporting_evidence?: string;
    recommended_decision_makers?: string;
    outreach_strategy?: string;
    communication_channel?: string;
    followup_timeline?: string;
    subject_line?: string;
    cold_email_opening?: string;
    next_best_action?: string;
  } | null;
  icp_breakdown?: {
    industry_match: number;
    company_size: number;
    buying_trigger: number;
    news_relevance: number;
    website_match: number;
    decision_makers_found: number;
  } | null;
  discovery_confidence?: number | null;
  evidence_sources?: string[] | null;
  pipeline_execution?: {
    [key: string]: {
      status: "completed" | "skipped" | "failed" | "running";
      duration: number;
    };
  } | null;
  execution_time?: number | null;
}

