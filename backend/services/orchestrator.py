from sqlalchemy.orm import Session
from datetime import datetime
import os
from services.company_service import enrich_contacts
from models.company import Company
from models.contact import Contact
from models.discovery_log import DiscoveryLog
from utils.normalizer import normalize_trigger_type, normalize_role
from utils.logger import log_discovery_step
from urllib.parse import urlparse
import traceback
import time
from config import settings
from services.news_service import search_news
from services.ai_service import analyze_company_pipeline
from app.tools.scraper import discover_and_scrape, _scrape_page
from concurrent.futures import ThreadPoolExecutor
from utils.icp import compute_deterministic_icp, compute_discovery_confidence

def resolve_company_name(url: str) -> str:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc or parsed_url.path
    if domain.startswith("www."):
        domain = domain[4:]
    parts = domain.split(".")
    if len(parts) >= 2:
        if parts[-2].lower() in ["co", "com", "net", "org", "edu", "gov"] and len(parts) >= 3:
            return parts[-3].capitalize()
        return parts[-2].capitalize()
    return parts[0].capitalize()

def run_firecrawl_task(url):
    t_start = time.time()
    firecrawl_used = False
    status = "completed"
    try:
        fc_key = settings.firecrawl_api_key or os.getenv("FIRECRAWL_API_KEY")
        website_content = discover_and_scrape(url)
        if fc_key:
            firecrawl_used = True
    except Exception as e:
        print(f"[PIPELINE ERROR] Firecrawl failed: {e}. Falling back to raw HTTP scrape.")
        try:
            website_content = _scrape_page(None, url)
            status = "completed"
        except Exception:
            website_content = ""
            status = "failed"
    duration = round(time.time() - t_start, 2)
    return website_content, firecrawl_used, duration, status

def run_newsapi_task(name_query):
    t_start = time.time()
    news_used = False
    status = "completed"
    try:
        news_data = search_news(name_query)
        news_used = len(news_data) > 0
        if not news_used:
            status = "skipped"
    except Exception as e:
        print(f"[PIPELINE ERROR] News search failed: {e}")
        news_data = []
        status = "failed"
    duration = round(time.time() - t_start, 2)
    return news_data, news_used, duration, status

def run_hunter_task(domain):
    t_start = time.time()
    status = "completed"
    try:
        contacts_data = enrich_contacts(domain)
        if not contacts_data:
            status = "skipped"
    except Exception as e:
        print(f"[PIPELINE ERROR] Hunter enrichment failed: {e}")
        contacts_data = []
        status = "failed"
    duration = round(time.time() - t_start, 2)
    return contacts_data, duration, status

def process_discovery(company_inputs: list, force_refresh: bool, db: Session) -> list:
    log_discovery_step(status="Discovery started", companies_found=len(company_inputs), db=db)
    results = []
    
    for c_input in company_inputs:
        url = c_input.url
        source = c_input.source
        
        try:
            total_start = time.time()
            
            # Extract domain and name query
            parsed_url = urlparse(url)
            domain = parsed_url.netloc or parsed_url.path
            if domain.startswith("www."):
                domain = domain[4:]
            name_query = resolve_company_name(url)
            
            # Duplicate check
            if not force_refresh:
                existing_company = db.query(Company).filter(Company.website == url).first()
                if existing_company:
                    # Fetch existing contacts
                    existing_contacts = db.query(Contact).filter(Contact.company_id == existing_company.id).all()
                    
                    # Generate dynamic fallback data for seed companies if missing
                    icp_breakdown_val = existing_company.icp_breakdown
                    if not icp_breakdown_val:
                        icp_breakdown_val = compute_deterministic_icp(
                            industry=existing_company.industry,
                            employee_count=existing_company.employee_count,
                            trigger_type=existing_company.trigger_type,
                            news_used=existing_company.news_used,
                            firecrawl_used=existing_company.firecrawl_used,
                            contacts_count=len(existing_contacts),
                            trigger_confidence=existing_company.trigger_confidence
                        )
                        # Save it back so it is cached
                        existing_company.icp_breakdown = icp_breakdown_val
                        db.commit()
                        
                    discovery_conf_val = existing_company.discovery_confidence
                    evidence_src_val = existing_company.evidence_sources
                    if discovery_conf_val is None:
                        conf_details = compute_discovery_confidence(
                            firecrawl_used=existing_company.firecrawl_used,
                            news_used=existing_company.news_used,
                            contacts_count=len(existing_contacts),
                            trigger_confidence=existing_company.trigger_confidence
                        )
                        discovery_conf_val = conf_details["confidence"]
                        evidence_src_val = conf_details["sources"]
                        existing_company.discovery_confidence = discovery_conf_val
                        existing_company.evidence_sources = evidence_src_val
                        db.commit()
                        
                    playbook_val = existing_company.sales_playbook
                    if not playbook_val:
                        playbook_val = {
                            "lead_priority": "High" if existing_company.qualified else "Medium",
                            "why_qualified": f"Company has matching industry: {existing_company.industry or 'Tech'} and ICP score of {existing_company.icp_score}.",
                            "buying_signals": f"Detected event: {existing_company.trigger_type or 'None'}.",
                            "supporting_evidence": f"Website crawled: {existing_company.firecrawl_used}, news search active: {existing_company.news_used}.",
                            "recommended_decision_makers": "Target sales decision makers and technical leads.",
                            "outreach_strategy": "Reach out highlighting value propositions relative to their industry sector.",
                            "communication_channel": "Email",
                            "followup_timeline": "3 days",
                            "subject_line": f"Outreach regarding {existing_company.name}",
                            "cold_email_opening": f"Hi team, I noticed {existing_company.name} is making great strides in {existing_company.industry or 'Tech'}.",
                            "next_best_action": "Reach out to verified contacts."
                        }
                        existing_company.sales_playbook = playbook_val
                        db.commit()

                    results.append({
                        "company": existing_company.name,
                        "trigger": existing_company.trigger_type,
                        "score": existing_company.icp_score,
                        "summary": existing_company.summary,
                        "status": "existing",
                        "trigger_confidence": existing_company.trigger_confidence,
                        "contact_confidence": existing_company.contact_confidence,
                        "summary_confidence": existing_company.summary_confidence,
                        "firecrawl_used": existing_company.firecrawl_used,
                        "news_used": existing_company.news_used,
                        "news_headlines": existing_company.news_headlines,
                        "trigger_source": existing_company.trigger_source,
                        "discovery_timestamp": existing_company.discovery_timestamp.isoformat() if existing_company.discovery_timestamp else None,
                        "sales_playbook": playbook_val,
                        "icp_breakdown": icp_breakdown_val,
                        "discovery_confidence": discovery_conf_val,
                        "evidence_sources": evidence_src_val,
                        "contacts": [
                            {
                                "name": c.name,
                                "role": c.role,
                                "email": c.email,
                                "linkedin": c.linkedin,
                                "phone": c.phone,
                                "source": c.source
                            } for c in existing_contacts
                        ]
                    })
                    continue
            
            # Run scrapers concurrently via ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=3) as executor:
                future_fc = executor.submit(run_firecrawl_task, url)
                future_news = executor.submit(run_newsapi_task, name_query)
                future_hunter = executor.submit(run_hunter_task, domain)
                
                website_content, firecrawl_used, fc_duration, fc_status = future_fc.result()
                news_data, news_used, news_duration, news_status = future_news.result()
                contacts_data, hunter_duration, hunter_status = future_hunter.result()

            log_discovery_step(status="Firecrawl completed", db=db)
            log_discovery_step(status="News search completed", db=db)
            
            headlines_list = [art.get("title") for art in news_data if art.get("title")]
            news_headlines_str = " | ".join(headlines_list[:5]) if headlines_list else None
            
            # 4. Groq Unified LLM Analysis
            t_groq_start = time.time()
            ai_status = "completed"
            try:
                analysis = analyze_company_pipeline(url, website_content, news_data, contacts_data)
            except Exception as e:
                print(f"[PIPELINE ERROR] Groq analysis failed: {e}")
                ai_status = "failed"
                raise e
                
            groq_duration = round(time.time() - t_groq_start, 2)
            log_discovery_step(status="AI analysis completed", db=db)
            
            # Map LLM contacts to save
            contacts_to_save = []
            seen_emails = set()
            
            for c in contacts_data:
                c_email = c.get("email")
                if c_email:
                    seen_emails.add(c_email.lower())
                contacts_to_save.append({
                    "name": c.get("name"),
                    "role": c.get("role"),
                    "email": c_email,
                    "linkedin": c.get("linkedin"),
                    "source": "Hunter"
                })
                
            extracted = analysis.get("contacts") or []
            for ext in extracted:
                ext_email = ext.get("email")
                if ext_email and ext_email.lower() in seen_emails:
                    continue
                contacts_to_save.append({
                    "name": ext.get("name"),
                    "role": ext.get("role"),
                    "email": ext_email,
                    "linkedin": ext.get("linkedin"),
                    "source": ext.get("source") or "AI Inference"
                })
            
            contact_conf = 0.9 if contacts_to_save else 0.0
            summary_conf = 0.85 if analysis.get("summary") else 0.0
            
            # Safely parse employee_estimate to int or None
            emp_est = analysis.get("employee_estimate")
            if emp_est is not None:
                try:
                    emp_est = int(float(str(emp_est)))
                except (ValueError, TypeError):
                    emp_est = None
            
            t_db_start = time.time()
            existing_company = db.query(Company).filter(Company.website == url).first()
            
            # Determine overall score deterministically in python
            overall_score = 0
            trg_type = normalize_trigger_type(analysis.get("trigger_event"))
            if trg_type and trg_type.lower() not in ["none", "no trigger detected", "unknown", "no trigger"]:
                overall_score += 50
                
            industry_val = (analysis.get("industry") or "AI / SaaS").lower()
            if any(kw in industry_val for kw in ["software", "ai", "saas", "tech", "cloud", "intelligence", "analytics"]):
                overall_score += 30
                
            if emp_est and emp_est >= 10:
                overall_score += 20
                
            is_qualified = overall_score >= 60
            trigger_src = analysis.get("trigger_source") or source

            # Compute breakdown and confidence scores
            icp_breakdown_val = compute_deterministic_icp(
                industry=analysis.get("industry") or "AI / SaaS",
                employee_count=emp_est,
                trigger_type=analysis.get("trigger_event"),
                news_used=news_used,
                firecrawl_used=firecrawl_used,
                contacts_count=len(contacts_to_save),
                trigger_confidence=analysis.get("trigger_confidence") or 0.8
            )
            
            conf_details = compute_discovery_confidence(
                firecrawl_used=firecrawl_used,
                news_used=news_used,
                contacts_count=len(contacts_to_save),
                trigger_confidence=analysis.get("trigger_confidence") or 0.8
            )
            
            if existing_company:
                is_new = False
                company = existing_company
                company.name = analysis.get("company_name")
                company.trigger_type = trg_type
                company.trigger_source = trigger_src
                company.trigger_confidence = analysis.get("trigger_confidence") or 0.8
                company.contact_confidence = contact_conf
                company.summary_confidence = summary_conf
                company.icp_score = float(overall_score)
                company.qualified = is_qualified
                company.summary = analysis.get("summary")
                company.status = "updated"
                company.industry = analysis.get("industry") or company.industry or "AI / SaaS"
                company.employee_count = emp_est or company.employee_count
                company.firecrawl_used = firecrawl_used
                company.news_used = news_used
                company.news_headlines = news_headlines_str
                company.discovery_timestamp = datetime.utcnow()
                company.icp_breakdown = icp_breakdown_val
                company.sales_playbook = analysis.get("sales_playbook")
                company.discovery_confidence = conf_details["confidence"]
                company.evidence_sources = conf_details["sources"]
            else:
                is_new = True
                company = Company(
                    name=analysis.get("company_name"),
                    website=url,
                    trigger_type=trg_type,
                    trigger_source=trigger_src,
                    trigger_confidence=analysis.get("trigger_confidence") or 0.8,
                    contact_confidence=contact_conf,
                    summary_confidence=summary_conf,
                    icp_score=float(overall_score),
                    qualified=is_qualified,
                    summary=analysis.get("summary"),
                    status="new",
                    industry=analysis.get("industry") or "AI / SaaS",
                    employee_count=emp_est,
                    firecrawl_used=firecrawl_used,
                    news_used=news_used,
                    news_headlines=news_headlines_str,
                    discovery_timestamp=datetime.utcnow(),
                    icp_breakdown=icp_breakdown_val,
                    sales_playbook=analysis.get("sales_playbook"),
                    discovery_confidence=conf_details["confidence"],
                    evidence_sources=conf_details["sources"]
                )
                db.add(company)
            
            db.flush() # To get company.id or apply updates
            log_discovery_step(status="Company saved", db=db)
            
            # 6. Save Contacts
            saved_contacts = []
            for c_data in contacts_to_save:
                existing_contact = None
                if c_data.get("email"):
                    existing_contact = db.query(Contact).filter(
                        Contact.company_id == company.id,
                        Contact.email == c_data.get("email")
                    ).first()
                elif c_data.get("name"):
                    existing_contact = db.query(Contact).filter(
                        Contact.company_id == company.id,
                        Contact.name == c_data.get("name")
                    ).first()
                
                role_val = normalize_role(c_data.get("role"))
                
                # Check for fake/dummy email addresses
                email_val = c_data.get("email")
                if email_val and ("dummy" in email_val.lower() or "example" in email_val.lower() or "placeholder" in email_val.lower()):
                    email_val = None
                
                if existing_contact:
                    existing_contact.role = role_val
                    if c_data.get("linkedin"):
                        existing_contact.linkedin = c_data.get("linkedin")
                    if c_data.get("phone"):
                        existing_contact.phone = c_data.get("phone")
                    if c_data.get("source"):
                        existing_contact.source = c_data.get("source")
                    saved_contacts.append(existing_contact)
                    continue
                        
                contact = Contact(
                    company_id=company.id,
                    name=c_data.get("name"),
                    role=role_val,
                    email=email_val,
                    linkedin=c_data.get("linkedin"),
                    phone=c_data.get("phone"),
                    source=c_data.get("source") or "Manual"
                )
                db.add(contact)
                saved_contacts.append(contact)
            
            # Log execution timing
            total_time = round(time.time() - total_start, 2)
            db_duration = round(time.time() - t_db_start, 2)
            print(f"[PIPELINE] Discovery finished in {total_time:.2f}s")
            
            log_entry = DiscoveryLog(
                input_source=source,
                status="completed",
                companies_found=1,
                trigger_time=fc_duration,
                icp_time=news_duration,
                summary_time=groq_duration,
                contacts_time=hunter_duration,
                total_time=total_time
            )
            db.add(log_entry)
            
            db.commit()
            log_discovery_step(status="Contacts saved", db=db)
            
            # Construct execution logs (returned transiently in JSON)
            pipeline_execution = {
                "website_agent": {"status": fc_status, "duration": fc_duration},
                "news_agent": {"status": news_status, "duration": news_duration},
                "contact_agent": {"status": hunter_status, "duration": hunter_duration},
                "ai_agent": {"status": ai_status, "duration": groq_duration},
                "database": {"status": "completed", "duration": db_duration}
            }

            results.append({
                "company": company.name,
                "trigger": company.trigger_type,
                "score": company.icp_score,
                "summary": company.summary,
                "status": "new" if is_new else "updated",
                "trigger_confidence": company.trigger_confidence,
                "contact_confidence": company.contact_confidence,
                "summary_confidence": company.summary_confidence,
                "firecrawl_used": company.firecrawl_used,
                "news_used": company.news_used,
                "news_headlines": company.news_headlines,
                "trigger_source": company.trigger_source,
                "discovery_timestamp": company.discovery_timestamp.isoformat() if company.discovery_timestamp else None,
                "sales_playbook": company.sales_playbook,
                "icp_breakdown": company.icp_breakdown,
                "discovery_confidence": company.discovery_confidence,
                "evidence_sources": company.evidence_sources,
                "pipeline_execution": pipeline_execution,
                "execution_time": total_time,
                "contacts": [
                    {
                        "name": c.name,
                        "role": c.role,
                        "email": c.email,
                        "linkedin": c.linkedin,
                        "phone": c.phone,
                        "source": c.source
                    } for c in saved_contacts
                ]
            })
            
        except Exception as e:
            db.rollback()
            print(f"[ORCHESTRATOR ERROR] {e}")
            traceback.print_exc()
            results.append({
                "status": "partial",
                "error": str(e)
            })
            log_discovery_step(status=f"Discovery failed: {e}", db=db)
            
    log_discovery_step(status="Discovery completed", companies_found=len(results), db=db)
    return results
