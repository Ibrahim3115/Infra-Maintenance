from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    runs = relationship("ReconciliationRun", back_populates="user", cascade="all, delete-orphan")

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

    # Link run to user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user = relationship("User", back_populates="runs")

