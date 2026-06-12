import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AnalysisContext } from "../context/AnalysisContext";
import PageContainer from "../components/PageContainer";
import TableCard from "../components/TableCard";
import LoadingSpinner from "../components/LoadingSpinner";

function History() {
  const { token } = useContext(AuthContext);
  const { setAnalysisResult } = useContext(AnalysisContext);
  const navigate = useNavigate();

  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  // Hover states for dynamic transitions
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("http://127.0.0.1:8000/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to retrieve inventory reconciliation audit log.");
        }
        const data = await response.json();
        if (active) {
          // Sort newest first explicitly
          const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRuns(sorted);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (token) {
      fetchHistory();
    }
    return () => {
      active = false;
    };
  }, [token]);

  const handleViewDetails = async (runId) => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/history/${runId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to retrieve detailed run data.");
      }
      const run = await response.json();

      // Format response to match the AnalysisContext schema
      const formatted = {
        id: run.id,
        created_at: run.created_at,
        total_cmdb_assets: run.total_cmdb_assets,
        total_live_assets: run.total_live_assets,
        missing_assets: run.missing_assets || [],
        extra_assets: run.extra_assets || [],
        naming_mismatches: run.naming_mismatches || [],
        gemini_analysis: {
          risk_level: run.gemini_risk_level,
          executive_summary: run.gemini_summary,
          recommended_actions: run.gemini_recommended_actions || [],
        },
      };

      setAnalysisResult(formatted);
      navigate("/results");
    } catch (err) {
      alert(err.message || "Could not load historical run details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDownloadReport = (runId) => {
    window.open(`http://127.0.0.1:8000/report/${runId}?token=${token}`, "_blank");
  };

  // Filter & Search logic
  const filteredRuns = runs.filter((run) => {
    const matchesSearch = searchQuery.trim() === "" || run.id.toString().includes(searchQuery.trim());
    const matchesRisk =
      riskFilter === "all" || run.gemini_risk_level?.toLowerCase() === riskFilter.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  if (error) {
    return (
      <PageContainer title="Inventory Reconciliation History">
        <div
          style={{
            backgroundColor: "var(--color-missing-bg)",
            border: "1px solid var(--color-missing-border)",
            borderRadius: "var(--radius-lg)",
            padding: "32px",
            color: "var(--color-missing)",
            maxWidth: "600px",
            margin: "40px auto",
            textAlign: "center",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <span style={{ fontSize: "32px", marginBottom: "12px", display: "block" }}>⚠️</span>
          <h3 style={{ fontWeight: "700", marginBottom: "8px", fontSize: "18px" }}>Database Sync Failure</h3>
          <p style={{ fontSize: "14px", color: "#7f1d1d", lineHeight: "1.6" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "var(--color-missing)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Retry Connection
          </button>
        </div>
      </PageContainer>
    );
  }

  if (isLoading || isActionLoading) {
    return (
      <PageContainer title="Inventory Reconciliation History">
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "40px",
            boxShadow: "var(--shadow-md)",
            maxWidth: "600px",
            margin: "40px auto",
          }}
        >
          <LoadingSpinner
            label={isActionLoading ? "Retrieving run details from PostgreSQL..." : "Loading historical audit runs..."}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Inventory Reconciliation History"
      subtitle="Browse, search, and analyze all past reconciliation reports and database sync events."
    >
      {/* Search & Filter Inputs Panel */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginBottom: "32px",
          boxShadow: "var(--shadow-sm)",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px" }}>
          <label
            htmlFor="search-runs"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-muted)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Search by Run ID
          </label>
          <input
            id="search-runs"
            type="text"
            placeholder="e.g. 10, 12, ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-main)",
            }}
          />
        </div>

        <div style={{ width: "200px" }}>
          <label
            htmlFor="risk-filter"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-muted)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Filter Risk Level
          </label>
          <select
            id="risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-main)",
              cursor: "pointer",
            }}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {runs.length === 0 ? (
        <div style={{ marginTop: "40px" }}>
          <PageContainer>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 32px",
                border: "2px dashed var(--border-color)",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--bg-card)",
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ fontSize: "56px", marginBottom: "20px", color: "var(--text-muted)", userSelect: "none" }}>
                📁
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 8px 0" }}>
                No Runs Found
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 28px 0", maxWidth: "360px", lineHeight: "1.6" }}>
                You have not performed any inventory reconciliation analysis audits yet.
              </p>
              <button
                onClick={() => navigate("/upload")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.15)",
                }}
              >
                Upload Files
              </button>
            </div>
          </PageContainer>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "14px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🔍</span>
          <p style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
            No Matching Reconciliation Runs
          </p>
          <p style={{ fontSize: "13px" }}>
            Try resetting your search query or risk filters.
          </p>
        </div>
      ) : (
        <TableCard
          title="All Historical Reconciliation Runs"
          badgeText={`${filteredRuns.length} Matching`}
          badgeBgColor="var(--primary)"
          headers={[
            "Run ID",
            "Timestamp",
            "CMDB Assets",
            "Live Assets",
            "Discrepancies",
            "Risk Assessment",
            "Actions",
          ]}
          data={filteredRuns}
          renderRow={(run) => {
            let riskColor = "var(--text-muted)";
            let riskBg = "var(--border-color)";
            let riskBorder = "var(--border-color)";
            const r = run.gemini_risk_level?.toLowerCase() || "";
            if (r === "low") {
              riskColor = "var(--color-success)";
              riskBg = "var(--color-success-bg)";
              riskBorder = "rgba(34, 197, 94, 0.2)";
            } else if (r === "medium") {
              riskColor = "var(--color-extra)";
              riskBg = "var(--color-extra-bg)";
              riskBorder = "var(--color-extra-border)";
            } else if (r === "high") {
              riskColor = "var(--color-missing)";
              riskBg = "var(--color-missing-bg)";
              riskBorder = "var(--color-missing-border)";
            }

            return (
              <>
                <td style={{ padding: "14px 24px", fontWeight: "700", color: "var(--text-main)" }}>
                  #{run.id}
                </td>
                <td style={{ padding: "14px 24px", color: "var(--text-muted)", fontWeight: "500" }}>
                  {new Date(run.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "14px 24px", fontWeight: "600", color: "var(--text-main)" }}>
                  {run.total_cmdb_assets}
                </td>
                <td style={{ padding: "14px 24px", fontWeight: "600", color: "var(--text-main)" }}>
                  {run.total_live_assets}
                </td>
                <td style={{ padding: "14px 24px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-missing-bg)",
                        color: "var(--color-missing)",
                        border: "1px solid var(--color-missing-border)",
                        fontWeight: "600",
                      }}
                    >
                      {run.missing_count} Missing
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-extra-bg)",
                        color: "var(--color-extra)",
                        border: "1px solid var(--color-extra-border)",
                        fontWeight: "600",
                      }}
                    >
                      {run.extra_count} Extra
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-mismatch-bg)",
                        color: "var(--color-mismatch)",
                        border: "1px solid var(--color-mismatch-border)",
                        fontWeight: "600",
                      }}
                    >
                      {run.mismatch_count} Mismatches
                    </span>
                  </div>
                </td>
                <td style={{ padding: "14px 24px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      backgroundColor: riskBg,
                      color: riskColor,
                      border: `1px solid ${riskBorder}`,
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    {run.gemini_risk_level}
                  </span>
                </td>
                <td style={{ padding: "14px 24px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleViewDetails(run.id)}
                      onMouseEnter={() => setHoveredBtn(`view-${run.id}`)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor:
                          hoveredBtn === `view-${run.id}` ? "var(--primary-hover)" : "var(--primary)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(37, 99, 235, 0.1)",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadReport(run.id)}
                      onMouseEnter={() => setHoveredBtn(`pdf-${run.id}`)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor:
                          hoveredBtn === `pdf-${run.id}` ? "var(--color-missing-bg)" : "transparent",
                        color: "var(--color-missing)",
                        border: "1px solid var(--color-missing-border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      PDF Report
                    </button>
                  </div>
                </td>
              </>
            );
          }}
        />
      )}
    </PageContainer>
  );
}

export default History;
