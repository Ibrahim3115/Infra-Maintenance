import { useContext } from "react";
import { Link } from "react-router-dom";
import { AnalysisContext } from "../context/AnalysisContext";

function Results() {
  const { analysisResult } = useContext(AnalysisContext);

  if (!analysisResult) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <h1 style={{ color: "#0f172a" }}>Reconciliation Results</h1>
        <div
          style={{
            marginTop: "30px",
            padding: "30px",
            border: "1px dashed #cbd5e1",
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
            display: "inline-block",
            maxWidth: "500px",
          }}
        >
          <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "20px" }}>
            No reconciliation results available. Please upload inventory files.
          </p>
          <Link
            to="/upload"
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "600",
            }}
          >
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  const tableHeaderStyle = {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #e2e8f0",
  };

  const tableCellStyle = {
    padding: "12px 16px",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
  };

  const renderTable = (headers, data, renderRow, emptyMessage) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "14px" }}>
          {emptyMessage}
        </div>
      );
    }

    return (
      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", marginTop: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={tableHeaderStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>{renderRow(item)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#0f172a", marginBottom: "30px" }}>Reconciliation Results</h1>

      {/* Missing Assets Section */}
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#ef4444", borderBottom: "2px solid #fecaca", paddingBottom: "8px", fontSize: "20px" }}>
          Missing Assets ({analysisResult.missing_assets?.length ?? 0})
        </h2>
        {renderTable(
          ["Asset ID", "Asset Name"],
          analysisResult.missing_assets,
          (asset) => (
            <>
              <td style={tableCellStyle}><strong>{asset.asset_id}</strong></td>
              <td style={tableCellStyle}>{asset.asset_name || asset.hostname || "N/A"}</td>
            </>
          ),
          "No missing assets detected (intended assets match live inventory)."
        )}
      </div>

      {/* Extra Assets Section */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#f97316", borderBottom: "2px solid #ffedd5", paddingBottom: "8px", fontSize: "20px" }}>
          Extra Assets ({analysisResult.extra_assets?.length ?? 0})
        </h2>
        {renderTable(
          ["Asset ID", "Asset Name"],
          analysisResult.extra_assets,
          (asset) => (
            <>
              <td style={tableCellStyle}><strong>{asset.asset_id}</strong></td>
              <td style={tableCellStyle}>{asset.asset_name || asset.hostname || "N/A"}</td>
            </>
          ),
          "No extra assets detected (no unexpected live assets found)."
        )}
      </div>

      {/* Naming Mismatches Section */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#eab308", borderBottom: "2px solid #fef9c3", paddingBottom: "8px", fontSize: "20px" }}>
          Naming Mismatches ({analysisResult.naming_mismatches?.length ?? 0})
        </h2>
        {renderTable(
          ["Asset ID", "Intended (CMDB) Name", "Live Name"],
          analysisResult.naming_mismatches,
          (mismatch) => (
            <>
              <td style={tableCellStyle}><strong>{mismatch.asset_id}</strong></td>
              <td style={tableCellStyle}><span style={{ color: "#ef4444" }}>{mismatch.cmdb_name}</span></td>
              <td style={tableCellStyle}><span style={{ color: "#22c55e" }}>{mismatch.live_name}</span></td>
            </>
          ),
          "No naming mismatches detected."
        )}
      </div>

      {/* Local AI Summary (No Gemini API integration) */}
      <div style={{ marginTop: "50px", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
        <h3 style={{ color: "#0f172a", marginTop: 0, fontSize: "16px", fontWeight: "600" }}>System Reconciliation Summary</h3>
        <p style={{ color: "#475569", lineHeight: "1.6", margin: "10px 0 0 0" }}>
          The analysis processed <strong>{analysisResult.total_cmdb_assets}</strong> intended CMDB assets and <strong>{analysisResult.total_live_assets}</strong> active live assets. 
          There are <strong>{analysisResult.missing_assets?.length ?? 0}</strong> missing assets, <strong>{analysisResult.extra_assets?.length ?? 0}</strong> extra assets, and <strong>{analysisResult.naming_mismatches?.length ?? 0}</strong> naming mismatches. 
          Please review the details in the tables above and sync the inventory systems.
        </p>
      </div>
    </div>
  );
}

export default Results;