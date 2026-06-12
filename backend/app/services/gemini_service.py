import os
import json
import re
from typing import Optional, List, Dict, Any

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


def _build_copilot_fallback(question: str, risk_level: str, missing_count: int, extra_count: int, mismatch_count: int) -> str:
    """Generate a context-aware fallback response when Gemini is unavailable."""
    total = missing_count + extra_count + mismatch_count
    risk = (risk_level or "unknown").lower()

    q = question.lower()

    if "risk" in q or "why" in q:
        if risk == "high":
            return (
                f"This audit is classified as **High Risk** due to {total} total discrepancies: "
                f"{missing_count} missing assets, {extra_count} extra assets, and {mismatch_count} naming mismatches. "
                "High discrepancy counts indicate a potential breakdown in the provisioning or decommissioning pipeline. "
                "Immediate remediation is recommended before the next audit cycle."
            )
        elif risk == "medium":
            return (
                f"This audit is classified as **Medium Risk** with {total} discrepancies. "
                "The environment shows minor synchronization gaps — likely caused by batch update lag or partial deployments. "
                "Review each discrepancy class and resolve within the next maintenance window."
            )
        else:
            return (
                "This audit is classified as **Low Risk**. All assets are well-aligned between CMDB records and live inventory. "
                "Continue standard monitoring and ensure automated checks remain active."
            )
    elif "missing" in q:
        return (
            f"There are **{missing_count} missing asset(s)** — assets present in CMDB but not found in the live environment. "
            "These may have been decommissioned without removing CMDB entries, or may be experiencing connectivity issues. "
            "Recommended actions: verify host reachability, cross-reference decommission logs, and clean up stale CMDB records."
        )
    elif "extra" in q or "unauthorized" in q or "unregistered" in q:
        return (
            f"There are **{extra_count} extra asset(s)** — live systems not registered in CMDB. "
            "These may represent shadow IT, unauthorized deployments, or systems provisioned outside of standard change management. "
            "Recommended actions: investigate ownership, register or decommission as appropriate, and tighten provisioning controls."
        )
    elif "mismatch" in q or "naming" in q or "hostname" in q:
        return (
            f"There are **{mismatch_count} naming mismatch(es)** — assets with identical IDs but different hostnames across CMDB and live records. "
            "This typically indicates hostname changes not propagated to CMDB, or manual corrections applied in isolation. "
            "Recommended actions: normalize naming conventions and enforce configuration sync pipelines."
        )
    elif "recommend" in q or "action" in q or "fix" in q or "resolve" in q:
        actions = []
        if missing_count > 0:
            actions.append(f"Investigate {missing_count} missing asset(s) — verify decommission state or network reachability.")
        if extra_count > 0:
            actions.append(f"Audit {extra_count} extra live asset(s) — register or decommission rogue deployments.")
        if mismatch_count > 0:
            actions.append(f"Correct {mismatch_count} naming mismatch(es) — synchronize hostnames across CMDB and live registers.")
        if not actions:
            actions = ["No immediate actions required. Maintain current audit frequency and monitoring."]
        return "**Recommended Actions:**\n" + "\n".join(f"- {a}" for a in actions)
    else:
        return (
            f"This reconciliation audit found {total} total discrepancy(ies): "
            f"{missing_count} missing, {extra_count} extra, and {mismatch_count} naming mismatches. "
            f"The overall risk level is **{risk_level or 'Unknown'}**. "
            "Review each discrepancy category in the audit report for targeted remediation steps."
        )


def ask_copilot_assistant(
    question: str,
    risk_level: str,
    executive_summary: str,
    root_cause_analysis: str,
    recommended_actions: List[str],
    missing_assets: List[Dict[str, Any]],
    extra_assets: List[Dict[str, Any]],
    naming_mismatches: List[Dict[str, Any]],
) -> str:
    """Ask the Gemini Copilot a question about a specific reconciliation run. Returns a plain-text answer."""
    api_key = os.environ.get("GEMINI_API_KEY")

    missing_count = len(missing_assets)
    extra_count = len(extra_assets)
    mismatch_count = len(naming_mismatches)

    # Build compact asset summaries (cap at 10 items to keep token count manageable)
    def _summarize(assets, keys, cap=10):
        subset = assets[:cap]
        lines = []
        for a in subset:
            lines.append(", ".join(f"{k}: {a.get(k, 'N/A')}" for k in keys))
        if len(assets) > cap:
            lines.append(f"... and {len(assets) - cap} more.")
        return "\n".join(lines) if lines else "None"

    missing_summary = _summarize(missing_assets, ["asset_id", "asset_name"])
    extra_summary = _summarize(extra_assets, ["asset_id", "asset_name"])
    mismatch_summary = _summarize(naming_mismatches, ["asset_id", "cmdb_name", "live_name"])
    actions_text = "\n".join(f"- {a}" for a in recommended_actions) if recommended_actions else "None provided."

    if not api_key:
        return _build_copilot_fallback(question, risk_level, missing_count, extra_count, mismatch_count)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
You are an expert IT Infrastructure Audit Copilot. A user has uploaded inventory files and run a reconciliation audit. 
You have been provided the complete audit context below. Answer the user's question concisely and professionally.

--- AUDIT CONTEXT ---
Risk Level: {risk_level}
Total Missing Assets: {missing_count}
Total Extra Assets: {extra_count}
Total Naming Mismatches: {mismatch_count}

Executive Summary:
{executive_summary}

Root Cause Analysis:
{root_cause_analysis}

Recommended Actions:
{actions_text}

Missing Assets (in CMDB but not live):
{missing_summary}

Extra Assets (live but not in CMDB):
{extra_summary}

Naming Mismatches (same ID, different name):
{mismatch_summary}
--- END AUDIT CONTEXT ---

User Question: {question}

Instructions:
- Respond with a concise, professional, infrastructure-focused answer.
- Base your answer ONLY on the audit data provided above.
- Be action-oriented: if the question implies a problem, suggest a specific remediation step.
- Keep the response under 200 words.
- Do NOT use markdown headers. You may use bold text and bullet points.
- Do NOT fabricate data or invent asset IDs.
"""
        response = model.generate_content(prompt)
        answer = response.text.strip()
        return answer if answer else _build_copilot_fallback(question, risk_level, missing_count, extra_count, mismatch_count)

    except Exception:
        return _build_copilot_fallback(question, risk_level, missing_count, extra_count, mismatch_count)
