from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/analyze")
async def analyze_inventory(
    csv_file: UploadFile = File(...),
    json_file: UploadFile = File(...)
):
    return {
        "message": "Files received successfully",
        "csv_file": csv_file.filename,
        "json_file": json_file.filename
    }