import os
import json
import re

def get_fallback_insights(
    total_cmdb_assets: int,
    total_live_assets: int,
    missing_assets_count: int,
    extra_assets_count: int,
    naming_mismatches_count: int
) -> dict:
    """Generates dynamic local fallback audit insights if the Gemini API is offline or unconfigured."""
    total_discrepancies = missing_assets_count + extra_assets_count + naming_mismatches_count
    
    if total_discrepancies == 0:
        risk_level = "Low"
        executive_summary = (
            f"Inventory reconciliation completed successfully. Both the CMDB registry ({total_cmdb_assets} assets) "
            f"and the live environment ({total_live_assets} assets) are perfectly aligned. No discrepancies were detected."
        )
        root_cause_analysis = "Infrastructure registers are fully synchronized with active environments. Systems are operating in a healthy state."
        recommended_actions = [
            "Maintain current inventory reporting and verification frequency.",
            "Continue enforcing automated configuration management checks."
        ]
    elif total_discrepancies > 5:
        risk_level = "High"
        executive_summary = (
            f"Critical inventory discrepancies detected: {missing_assets_count} missing, {extra_assets_count} extra, "
            f"and {naming_mismatches_count} naming mismatches. Immediate corrective action is recommended to align "
            f"CMDB logs with active network assets."
        )
        root_cause_analysis = (
            "Potential breakdown in the provisioning or decommissioning change management pipeline. "
            "Unregistered virtual machines or active services may have been started without standard configuration logs, "
            "or offline systems were not cleaned up from CMDB logs."
        )
        recommended_actions = [
            "Perform immediate forensic auditing on the unregistered extra assets.",
            "Re-verify if the missing assets are decommissioned or experiencing connectivity issues.",
            "Standardize asset registration procedures within the deployment pipeline."
        ]
    else:
        risk_level = "Medium"
        executive_summary = (
            f"Moderate inventory discrepancies detected: {missing_assets_count} missing, {extra_assets_count} extra, "
            f"and {naming_mismatches_count} naming mismatches. Standard maintenance review is advised."
        )
        root_cause_analysis = (
            "Minor synchronization lag between active environment configuration registers and live tracking systems. "
            "This is typically caused by batch synchronization cycles or minor naming updates not fully propagating."
        )
        recommended_actions = [
            "Audit naming mismatches and synchronize live hostnames with CMDB registers.",
            "Verify network reachability for missing hostnames.",
            "Update registry entries for verified extra assets."
        ]
        
    return {
        "executive_summary": executive_summary,
        "risk_level": risk_level,
        "root_cause_analysis": root_cause_analysis,
        "recommended_actions": recommended_actions
    }

def generate_ai_insights(
    total_cmdb_assets: int,
    total_live_assets: int,
    missing_assets_count: int,
    extra_assets_count: int,
    naming_mismatches_count: int
) -> dict:
    """Calls Google Gemini API to get structured inventory analysis. Falls back on failure."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_fallback_insights(
            total_cmdb_assets, total_live_assets, missing_assets_count, extra_assets_count, naming_mismatches_count
        )

    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        
        # Using gemini-1.5-flash for speed and structured outputs
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
You are an AI IT Infrastructure auditor. Analyze the following inventory reconciliation metrics:
- Total CMDB (intended) assets: {total_cmdb_assets}
- Total Live (discovered) assets: {total_live_assets}
- Missing assets count (in CMDB but not live): {missing_assets_count}
- Extra assets count (live but not in CMDB): {extra_assets_count}
- Naming mismatches count (same ID, different names): {naming_mismatches_count}

Generate an analysis in the following strict JSON schema:
{{
  "executive_summary": "A concise executive summary of the overall alignment between registers and active systems.",
  "risk_level": "Low, Medium, or High based on the number and severity of discrepancies.",
  "root_cause_analysis": "An analysis of why these discrepancies likely exist (e.g., unauthorized changes, lagging registry, provisioning gaps).",
  "recommended_actions": [
    "Action item 1",
    "Action item 2",
    "Action item 3"
  ]
}}

Return ONLY valid JSON. Do not include markdown code block formatting (like ```json). Just return the raw JSON object.
"""
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        text = response.text.strip()
        
        # Clean markdown code blocks if the model ignored instructions
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            json_text = match.group(0)
        else:
            json_text = text
            
        data = json.loads(json_text)
        
        # Validate critical fields
        required_keys = ["executive_summary", "risk_level", "root_cause_analysis", "recommended_actions"]
        if all(key in data for key in required_keys) and isinstance(data["recommended_actions"], list):
            # Ensure risk level is strictly capitalized as expected in frontend: 'Low', 'Medium', 'High'
            risk = str(data["risk_level"]).capitalize()
            if risk not in ["Low", "Medium", "High"]:
                # Default logic if risk level string is unexpected
                risk = "Low" if (missing_assets_count + extra_assets_count + naming_mismatches_count) == 0 else "Medium"
            data["risk_level"] = risk
            return data
        else:
            raise ValueError("Invalid JSON schema returned by Gemini")
            
    except Exception as e:
        # Fallback cleanly
        return get_fallback_insights(
            total_cmdb_assets, total_live_assets, missing_assets_count, extra_assets_count, naming_mismatches_count
        )
