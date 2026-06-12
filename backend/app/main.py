from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import router as upload_router
from app.routes.auth import router as auth_router
from dotenv import load_dotenv
import os
from app.database import engine, Base
from app.models import ReconciliationRun
from sqlalchemy import text

# Load environment variables
load_dotenv()

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Self-healing migration check for user_id column
try:
    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='reconciliation_runs' AND column_name='user_id';"
        ))
        if not result.fetchone():
            print("Auto-migration: adding user_id column to reconciliation_runs table")
            conn.execute(text(
                "ALTER TABLE reconciliation_runs ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;"
            ))
            conn.commit()
except Exception as e:
    print("Database migration error:", e)

app = FastAPI(title="IM-07 Inventory Reconciliation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "IM-07 API Running"}