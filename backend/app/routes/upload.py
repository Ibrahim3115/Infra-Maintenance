from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
import csv
import json
from io import StringIO
from app.services.gemini_service import generate_ai_insights
from app.database import get_db, SessionLocal
from app.models import ReconciliationRun, User
from sqlalchemy.orm import Session
from app.services.pdf_service import generate_pdf_report
from app.auth_utils import get_current_user, oauth2_scheme, SECRET_KEY, ALGORITHM
import jwt

router = APIRouter()


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    runs = db.query(ReconciliationRun).filter(
        ReconciliationRun.user_id == current_user.id
    ).order_by(ReconciliationRun.created_at.desc()).all()
    return runs


@router.get("/history/latest")
def get_latest(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(ReconciliationRun).filter(
        ReconciliationRun.user_id == current_user.id
    ).order_by(ReconciliationRun.created_at.desc()).first()
    return run


@router.get("/history/{run_id}")
def get_run_details(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(ReconciliationRun).filter(
        ReconciliationRun.id == run_id,
        ReconciliationRun.user_id == current_user.id
    ).first()
    if not run:
        raise HTTPException(status_code=404, detail="Reconciliation run not found.")
    return run


@router.get("/report/{run_id}")
def get_pdf_report(
    run_id: int,
    token: str = Query(None),
    db: Session = Depends(get_db),
    header_token: str = Depends(oauth2_scheme)
):
    actual_token = token or header_token
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not actual_token:
        raise credentials_exception
    try:
        payload = jwt.decode(actual_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    current_user = db.query(User).filter(User.username == username).first()
    if not current_user:
        raise credentials_exception

    run = db.query(ReconciliationRun).filter(
        ReconciliationRun.id == run_id,
        ReconciliationRun.user_id == current_user.id
    ).first()
    if not run:
        raise HTTPException(status_code=404, detail="Reconciliation run not found.")
    
    pdf_buffer = generate_pdf_report(run)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=reconciliation-report-{run_id}.pdf"}
    )


@router.post("/analyze")
async def analyze_inventory(
    csv_file: UploadFile = File(...),
    json_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        # Read CSV
        csv_content = await csv_file.read()
        csv_text = csv_content.decode("utf-8")

        csv_reader = csv.DictReader(StringIO(csv_text))
        cmdb_assets = list(csv_reader)

        # Read JSON
        json_content = await json_file.read()
        live_assets = json.loads(json_content.decode("utf-8"))

        # Lookup dictionaries
        cmdb_lookup = {
            asset["asset_id"]: asset
            for asset in cmdb_assets
        }

        live_lookup = {
            asset["asset_id"]: asset
            for asset in live_assets
        }

        cmdb_ids = set(cmdb_lookup.keys())
        live_ids = set(live_lookup.keys())

        # Missing Assets
        missing_assets = [
            cmdb_lookup[asset_id]
            for asset_id in (cmdb_ids - live_ids)
        ]

        # Extra Assets
        extra_assets = [
            live_lookup[asset_id]
            for asset_id in (live_ids - cmdb_ids)
        ]

        # Naming Mismatches
        naming_mismatches = []

        common_ids = cmdb_ids.intersection(live_ids)

        for asset_id in common_ids:
            cmdb_name = cmdb_lookup[asset_id]["asset_name"]
            live_name = live_lookup[asset_id]["asset_name"]

            if cmdb_name != live_name:
                naming_mismatches.append({
                    "asset_id": asset_id,
                    "cmdb_name": cmdb_name,
                    "live_name": live_name
                })

        gemini_analysis = generate_ai_insights(
            total_cmdb_assets=len(cmdb_assets),
            total_live_assets=len(live_assets),
            missing_assets_count=len(missing_assets),
            extra_assets_count=len(extra_assets),
            naming_mismatches_count=len(naming_mismatches)
        )

        # Save Reconciliation Run to Database
        run_id = None
        run_created_at = None
        try:
            db = SessionLocal()
            db_run = ReconciliationRun(
                total_cmdb_assets=len(cmdb_assets),
                total_live_assets=len(live_assets),
                missing_count=len(missing_assets),
                extra_count=len(extra_assets),
                mismatch_count=len(naming_mismatches),
                gemini_risk_level=gemini_analysis.get("risk_level", "Unknown"),
                gemini_summary=gemini_analysis.get("executive_summary", ""),
                missing_assets=missing_assets,
                extra_assets=extra_assets,
                naming_mismatches=naming_mismatches,
                gemini_recommended_actions=gemini_analysis.get("recommended_actions", []),
                user_id=current_user.id
            )
            db.add(db_run)
            db.commit()
            db.refresh(db_run)
            run_id = db_run.id
            run_created_at = db_run.created_at.isoformat()
            db.close()
        except Exception as db_err:
            print("DB Save Error:", db_err)

        return {
            "id": run_id,
            "created_at": run_created_at,
            "total_cmdb_assets": len(cmdb_assets),
            "total_live_assets": len(live_assets),
            "missing_assets": missing_assets,
            "extra_assets": extra_assets,
            "naming_mismatches": naming_mismatches,
            "gemini_analysis": gemini_analysis
        }

    except Exception as e:
        return {
            "error": str(e)
        }