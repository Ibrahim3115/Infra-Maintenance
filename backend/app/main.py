from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import router as upload_router
from dotenv import load_dotenv
import os
from app.database import engine, Base
from app.models import ReconciliationRun

# Load environment variables
load_dotenv()

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IM-07 Inventory Reconciliation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "IM-07 API Running"}