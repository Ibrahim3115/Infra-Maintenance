import { useContext } from "react";
import { AnalysisContext } from "../context/AnalysisContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { analysisResult } = useContext(AnalysisContext);

  const totalCmdb = analysisResult?.total_cmdb_assets ?? 0;
  const totalLive = analysisResult?.total_live_assets ?? 0;
  const missingCount = analysisResult?.missing_assets?.length ?? 0;
  const extraCount = analysisResult?.extra_assets?.length ?? 0;
  const mismatchCount = analysisResult?.naming_mismatches?.length ?? 0;

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ color: "#0f172a", marginBottom: "30px" }}>
        IM-07 Inventory Reconciliation Dashboard
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", width: "220px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#64748b", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>Total CMDB Assets</h3>
          <h2 style={{ color: "#0f172a", margin: 0, fontSize: "28px" }}>{totalCmdb}</h2>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", width: "220px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#64748b", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>Total Live Assets</h3>
          <h2 style={{ color: "#0f172a", margin: 0, fontSize: "28px" }}>{totalLive}</h2>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", width: "220px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#ef4444", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>Missing Assets</h3>
          <h2 style={{ color: "#ef4444", margin: 0, fontSize: "28px" }}>{missingCount}</h2>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", width: "220px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#f97316", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>Extra Assets</h3>
          <h2 style={{ color: "#f97316", margin: 0, fontSize: "28px" }}>{extraCount}</h2>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", width: "220px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#eab308", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>Naming Mismatches</h3>
          <h2 style={{ color: "#eab308", margin: 0, fontSize: "28px" }}>{mismatchCount}</h2>
        </div>
      </div>

      <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
        <h2 style={{ color: "#0f172a", marginTop: 0 }}>Recent Reconciliation Runs</h2>
        {analysisResult ? (
          <div>
            <p style={{ color: "#475569" }}>
              A reconciliation run was recently performed with the following results:
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.6" }}>
              <li><strong>{missingCount}</strong> missing assets detected.</li>
              <li><strong>{extraCount}</strong> unexpected extra assets detected.</li>
              <li><strong>{mismatchCount}</strong> naming mismatches detected.</li>
            </ul>
            <Link
              to="/results"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              View Detailed Results
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ color: "#64748b" }}>No reconciliation runs yet.</p>
            <Link
              to="/upload"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              Upload Files to Start
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;