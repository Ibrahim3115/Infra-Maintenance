from fastapi import FastAPI

app = FastAPI(title="IM-07 Inventory Reconciliation API")


@app.get("/")
def root():
    return {"message": "IM-07 API Running"}