from typing import List, Optional

def compute_deterministic_icp(
    industry: Optional[str], 
    employee_count: Optional[int], 
    trigger_type: Optional[str], 
    news_used: bool, 
    firecrawl_used: bool, 
    contacts_count: int, 
    trigger_confidence: Optional[float] = 0.8
) -> dict:
    """
    Computes deterministic component scores (0-100) for visual representation on the frontend.
    """
    # Safe float casting
    try:
        if trigger_confidence is not None:
            trigger_confidence = float(trigger_confidence)
    except (ValueError, TypeError):
        trigger_confidence = 0.8

    # 1. Industry Match
    industry_lower = (industry or "").lower().strip()
    if not industry_lower:
        industry_match = 30
    elif any(kw in industry_lower for kw in ["software", "ai", "saas", "tech", "cloud", "intelligence", "analytics"]):
        industry_match = 100
    elif any(kw in industry_lower for kw in ["service", "consulting", "agency", "digital", "platform"]):
        industry_match = 70
    else:
        industry_match = 30
        
    # 2. Company Size
    if employee_count is None or employee_count <= 0:
        company_size = 30
    elif employee_count >= 500:
        company_size = 100
    elif employee_count >= 100:
        company_size = 80
    elif employee_count >= 10:
        company_size = 60
    else:
        company_size = 40
        
    # 3. Buying Trigger
    trigger_lower = (trigger_type or "none").lower().strip()
    if trigger_lower in ["none", "no trigger detected", "unknown", "no trigger"]:
        buying_trigger = 0
    else:
        conf = trigger_confidence or 0.8
        buying_trigger = int(80 + (conf * 20))
        
    # 4. News Relevance
    if news_used:
        news_relevance = 90
    else:
        news_relevance = 20
        
    # 5. Website Match
    if firecrawl_used:
        website_match = 100
    else:
        website_match = 70
        
    # 6. Decision Maker Availability
    if contacts_count >= 5:
        decision_makers = 100
    elif contacts_count >= 1:
        decision_makers = 60
    else:
        decision_makers = 20
        
    return {
        "industry_match": industry_match,
        "company_size": company_size,
        "buying_trigger": buying_trigger,
        "news_relevance": news_relevance,
        "website_match": website_match,
        "decision_makers_found": decision_makers
    }

def compute_discovery_confidence(
    firecrawl_used: bool, 
    news_used: bool, 
    contacts_count: int, 
    trigger_confidence: Optional[float]
) -> dict:
    """
    Computes a discovery confidence percentage based on quality and availability of evidence sources.
    """
    # Safe float casting
    try:
        if trigger_confidence is not None:
            trigger_confidence = float(trigger_confidence)
    except (ValueError, TypeError):
        trigger_confidence = 0.8

    evidence = []
    points = 0
    
    if firecrawl_used:
        evidence.append("Firecrawl")
        points += 30
    else:
        evidence.append("HTTP Fallback")
        points += 15
        
    if news_used:
        evidence.append("NewsAPI")
        points += 25
        
    if contacts_count > 0:
        evidence.append("Hunter")
        points += 25
        
    if trigger_confidence and trigger_confidence > 0:
        evidence.append("AI Analysis")
        points += 20
        
    confidence_val = min(max(points, 10), 100) / 100.0
    
    return {
        "confidence": confidence_val,
        "sources": evidence
    }
