from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ReconciliationRun, User
from app.auth_utils import get_current_user
from app.services.gemini_service import ask_copilot_assistant

router = APIRouter(prefix="/copilot", tags=["copilot"])


class CopilotChatRequest(BaseModel):
    run_id: int
    question: str


class CopilotChatResponse(BaseModel):
    answer: str
    run_id: int


@router.post("/chat", response_model=CopilotChatResponse)
def copilot_chat(
    payload: CopilotChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ask the AI Copilot a question about a specific reconciliation run.
    The run must belong to the authenticated user.
    """
    # Validate question
    question = (payload.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if len(question) > 1000:
        raise HTTPException(status_code=400, detail="Question exceeds 1000 character limit.")

    # Fetch the run and verify ownership
    run = db.query(ReconciliationRun).filter(
        ReconciliationRun.id == payload.run_id,
        ReconciliationRun.user_id == current_user.id,
    ).first()

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Reconciliation run not found or does not belong to your account.",
        )

    # Extract context from the stored run
    answer = ask_copilot_assistant(
        question=question,
        risk_level=run.gemini_risk_level or "Unknown",
        executive_summary=run.gemini_summary or "",
        root_cause_analysis="",  # Not stored separately; Gemini will derive from context
        recommended_actions=run.gemini_recommended_actions or [],
        missing_assets=run.missing_assets or [],
        extra_assets=run.extra_assets or [],
        naming_mismatches=run.naming_mismatches or [],
    )

    return CopilotChatResponse(answer=answer, run_id=run.id)
