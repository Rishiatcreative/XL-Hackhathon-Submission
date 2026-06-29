from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from database import get_db
from models.company import Company
from models.contact import Contact
from models.discovery_log import DiscoveryLog
from schemas.company_schema import CompanyResponse

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyResponse])
def get_companies(response: Response, db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    # Count the completed discovery runs from the discovery logs
    discovery_runs = db.query(DiscoveryLog).count()
    response.headers["X-Discovery-Count"] = str(discovery_runs)
    # Expose custom header to client (CORS)
    response.headers["Access-Control-Expose-Headers"] = "X-Discovery-Count"
    return companies

@router.get("/{company_id}")
def get_company(company_id: UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    contacts = db.query(Contact).filter(Contact.company_id == company.id).all()
    
    company_dict = {c.name: getattr(company, c.name) for c in company.__table__.columns}
    contacts_list = [{c.name: getattr(contact, c.name) for c in contact.__table__.columns} for contact in contacts]
    
    return {
        **company_dict,
        "contacts": contacts_list
    }

from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

from services.ai_service import run_company_chat

@router.post("/{company_id}/chat")
def company_chat(company_id: UUID, request: ChatRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    contacts = db.query(Contact).filter(Contact.company_id == company.id).all()
    
    messages_list = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    
    try:
        reply = run_company_chat(company, contacts, messages_list)
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

