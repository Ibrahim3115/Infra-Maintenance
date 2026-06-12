from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.database import Base

class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_cmdb_assets = Column(Integer, nullable=False)
    total_live_assets = Column(Integer, nullable=False)
    missing_count = Column(Integer, nullable=False)
    extra_count = Column(Integer, nullable=False)
    mismatch_count = Column(Integer, nullable=False)
    gemini_risk_level = Column(String(50), nullable=False)
    gemini_summary = Column(Text, nullable=False)
    
    # Store complete audit datasets for PDF report generation
    missing_assets = Column(JSON, nullable=True)
    extra_assets = Column(JSON, nullable=True)
    naming_mismatches = Column(JSON, nullable=True)
    gemini_recommended_actions = Column(JSON, nullable=True)
