from fastapi import FastAPI
from app.routes.upload import router as upload_router

app = FastAPI(title="IM-07 Inventory Reconciliation API")

app.include_router(upload_router)


@app.get("/")
def root():
    return {"message": "IM-07 API Running"}