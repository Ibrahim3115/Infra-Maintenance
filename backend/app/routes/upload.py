from fastapi import APIRouter, UploadFile, File
import csv
import json
from io import StringIO

router = APIRouter()


@router.post("/analyze")
async def analyze_inventory(
    csv_file: UploadFile = File(...),
    json_file: UploadFile = File(...)
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

        return {
            "total_cmdb_assets": len(cmdb_assets),
            "total_live_assets": len(live_assets),
            "missing_assets": missing_assets,
            "extra_assets": extra_assets,
            "naming_mismatches": naming_mismatches
        }

    except Exception as e:
        return {
            "error": str(e)
        }