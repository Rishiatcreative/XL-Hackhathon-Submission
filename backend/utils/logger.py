from sqlalchemy.orm import Session
from models.discovery_log import DiscoveryLog
from database import SessionLocal

def log_discovery_step(status: str, input_source: str = "manual", companies_found: int = 0, db: Session = None):
    print(f"[DISCOVERY LOG] {status}")
    
    use_local_db = False
    if db is None:
        db = SessionLocal()
        use_local_db = True
        
    try:
        log_entry = DiscoveryLog(
            input_source=input_source,
            status=status,
            companies_found=companies_found
        )
        db.add(log_entry)
        if use_local_db:
            db.commit()
        else:
            db.flush()
    except Exception as e:
        print(f"[DISCOVERY LOG ERROR] Failed to save log: {e}")
        if use_local_db:
            db.rollback()
    finally:
        if use_local_db:
            db.close()

