import axios from "axios";
import { Company } from "@/types/company";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Create Axios Client
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Maps the live backend data properties to the expected frontend models.
 * Mappings:
 * - name -> company
 * - employee_count -> employees
 * - trigger_type -> trigger
 * - icp_score -> score
 */
export function mapBackendCompanyToFrontend(backend: any): Company {
  if (!backend) {
    throw new Error("Invalid backend company payload");
  }
  
  const rawIndustry = backend.industry;
  const isInvalidIndustry = !rawIndustry || 
    rawIndustry === "N/A" || 
    rawIndustry.toLowerCase() === "unknown" || 
    rawIndustry.toLowerCase() === "null" || 
    rawIndustry.toLowerCase() === "undefined";
  const industry = isInvalidIndustry ? "Not specified" : rawIndustry;

  const rawTrigger = backend.trigger_type;
  const isInvalidTrigger = !rawTrigger || 
    rawTrigger === "none" || 
    rawTrigger.toLowerCase() === "unknown" || 
    rawTrigger.toLowerCase() === "null" || 
    rawTrigger.toLowerCase() === "undefined";
  const trigger = isInvalidTrigger ? "No trigger detected" : rawTrigger;

  const rawTriggerSource = backend.trigger_source;
  const isInvalidSource = !rawTriggerSource || 
    rawTriggerSource.toLowerCase() === "unknown" || 
    rawTriggerSource.toLowerCase() === "null" || 
    rawTriggerSource.toLowerCase() === "undefined";
  const trigger_source = isInvalidSource ? "Website" : rawTriggerSource;

  const rawStatus = backend.status;
  const isInvalidStatus = !rawStatus || 
    rawStatus.toLowerCase() === "unknown" || 
    rawStatus.toLowerCase() === "null" || 
    rawStatus.toLowerCase() === "undefined";
  const status = isInvalidStatus ? "Discovered" : rawStatus;

  return {
    id: backend.id || "",
    company: backend.name || "Unnamed Company",
    website: backend.website || "",
    industry,
    employees: backend.employee_count !== undefined && backend.employee_count !== null ? backend.employee_count : null,
    trigger,
    score: backend.icp_score !== undefined && backend.icp_score !== null ? Math.round(backend.icp_score) : 0,
    summary: backend.summary ? backend.summary.replace(/\*\*/g, "").replace(/__/g, "") : "No automated summary available.",
    qualified: backend.qualified !== undefined ? backend.qualified : (backend.icp_score >= 60),
    trigger_source,
    trigger_confidence: backend.trigger_confidence !== undefined && backend.trigger_confidence !== null ? backend.trigger_confidence : null,
    contact_confidence: backend.contact_confidence !== undefined && backend.contact_confidence !== null ? backend.contact_confidence : null,
    summary_confidence: backend.summary_confidence !== undefined && backend.summary_confidence !== null ? backend.summary_confidence : null,
    status,
    created_at: backend.created_at || null,
    firecrawl_used: backend.firecrawl_used || false,
    news_used: backend.news_used || false,
    news_headlines: backend.news_headlines || null,
    discovery_timestamp: backend.discovery_timestamp || null,
    sales_playbook: backend.sales_playbook || null,
    icp_breakdown: backend.icp_breakdown || null,
    discovery_confidence: backend.discovery_confidence || null,
    evidence_sources: backend.evidence_sources || null,
    pipeline_execution: backend.pipeline_execution || null,
    execution_time: backend.execution_time || null,
    contacts: Array.isArray(backend.contacts)
      ? backend.contacts.map((contact: any) => {
          const rawRole = contact.role;
          const isInvalidRole = !rawRole || 
            rawRole.toLowerCase() === "unknown" || 
            rawRole.toLowerCase() === "null" || 
            rawRole.toLowerCase() === "undefined" || 
            rawRole.toLowerCase() === "role unavailable" || 
            rawRole.toLowerCase() === "role not available";
          const role = isInvalidRole ? "Role not available" : rawRole;

          const rawContactSource = contact.source;
          const isInvalidContactSource = !rawContactSource || 
            rawContactSource.toLowerCase() === "unknown" || 
            rawContactSource.toLowerCase() === "null" || 
            rawContactSource.toLowerCase() === "undefined";
          const source = isInvalidContactSource ? "Hunter" : rawContactSource;

          return {
            id: contact.id || "",
            name: contact.name || "Unnamed Contact",
            role,
            email: contact.email || null,
            linkedin: contact.linkedin || null,
            source,
          };
        })
      : [],
  };
}

export const apiService = {
  /**
   * Fetch all companies from the database along with discovery runs metadata.
   */
  async getCompanies(): Promise<{ companies: Company[]; discoveryRuns: number }> {
    const response = await axiosClient.get("/companies");
    const data = response.data;
    const discoveryRuns = parseInt(response.headers["x-discovery-count"] || "0", 10);
    if (Array.isArray(data)) {
      return {
        companies: data.map(mapBackendCompanyToFrontend),
        discoveryRuns
      };
    }
    return { companies: [], discoveryRuns: 0 };
  },

  /**
   * Fetch detailed company info, including related contacts.
   */
  async getCompanyById(id: string): Promise<Company> {
    const response = await axiosClient.get(`/companies/${id}`);
    return mapBackendCompanyToFrontend(response.data);
  },

  /**
   * Post manual discovery event.
   */
  async runDiscovery(url: string): Promise<any> {
    const payload = {
      company_inputs: [
        {
          url: url,
          source: "manual",
        },
      ],
      force_refresh: true,
    };
    const response = await axiosClient.post("/discover", payload);
    return response.data;
  },

  /**
   * Send a message to Ask ProspectIQ Chat for a given company.
   */
  async sendCompanyChatMessage(companyId: string, messages: { role: string; content: string }[]): Promise<string> {
    const response = await axiosClient.post(`/companies/${companyId}/chat`, { messages });
    return response.data.response;
  },
};

