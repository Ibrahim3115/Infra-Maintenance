import { useContext, useState, useEffect } from "react";
import { AnalysisContext } from "../context/AnalysisContext";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// Custom tooltips for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          boxShadow: "var(--shadow-md)",
          fontSize: "13px",
        }}
      >
        <p style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "var(--primary)", fontWeight: "600" }}>
          Issues: <span style={{ fontSize: "14px" }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          boxShadow: "var(--shadow-md)",
          fontSize: "13px",
        }}
      >
        <p style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: payload[0].payload.color, fontWeight: "600" }}>
          Runs: <span style={{ fontSize: "14px" }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};


function Dashboard() {
  const { analysisResult, clearAnalysisResult } = useContext(AnalysisContext);
  const [latestRun, setLatestRun] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch latest run
        const latestResponse = await fetch("http://127.0.0.1:8000/history/latest");
        if (!latestResponse.ok) {
          throw new Error("Failed to communicate with inventory database history API.");
        }
        const latestData = await latestResponse.json();

        // Fetch history
        const historyResponse = await fetch("http://127.0.0.1:8000/history");
        if (!historyResponse.ok) {
          throw new Error("Failed to retrieve inventory reconciliation audit log.");
        }
        const historyData = await historyResponse.json();

        if (active) {
          setLatestRun(latestData);
          setHistory(historyData);
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

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const activeRun = analysisResult || latestRun;

  const totalCmdb = activeRun?.total_cmdb_assets ?? 0;
  const totalLive = activeRun?.total_live_assets ?? 0;
  
  // Dynamic handling of properties depending on whether activeRun is from Upload or DB
  const missingCount = activeRun?.missing_assets ? activeRun.missing_assets.length : (activeRun?.missing_count ?? 0);
  const extraCount = activeRun?.extra_assets ? activeRun.extra_assets.length : (activeRun?.extra_count ?? 0);
  const mismatchCount = activeRun?.naming_mismatches ? activeRun.naming_mismatches.length : (activeRun?.mismatch_count ?? 0);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all reconciliation results?")) {
      clearAnalysisResult();
      setLatestRun(null);
    }
  };

  const actionButton = analysisResult ? (
    <button
      onClick={handleClear}
      style={{
        padding: "10px 18px",
        backgroundColor: "transparent",
        color: "var(--color-missing)",
        border: "1px solid var(--color-missing-border)",
        borderRadius: "var(--radius-sm)",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "var(--color-missing-bg)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "transparent";
      }}
    >
      Clear Results
    </button>
  ) : null;

  if (error) {
    return (
      <PageContainer title="Inventory Reconciliation Dashboard">
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
          <h3 style={{ fontWeight: "700", marginBottom: "8px", fontSize: "18px" }}>Database Synchronization Error</h3>
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
              transition: "opacity var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.target.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.target.style.opacity = "1.0"; }}
          >
            Retry Database Connection
          </button>
        </div>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer title="Inventory Reconciliation Dashboard">
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
          <LoadingSpinner label="Connecting to PostgreSQL database. Loading audit metrics..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Inventory Reconciliation Dashboard"
      subtitle="Overview of matching and discrepancies between CMDB records and live environments"
      action={actionButton}
    >
      {/* Metric Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <StatCard
          title="Total CMDB Assets"
          value={totalCmdb}
          color="var(--text-main)"
          indicatorColor="var(--primary)"
          description="Total assets in intended CSV inventory"
        />
        <StatCard
          title="Total Live Assets"
          value={totalLive}
          color="var(--text-main)"
          indicatorColor="var(--text-muted)"
          description="Total assets in live JSON environment"
        />
        <StatCard
          title="Missing Assets"
          value={missingCount}
          color="var(--color-missing)"
          indicatorColor="var(--color-missing)"
          description="In CMDB but not found live"
        />
        <StatCard
          title="Extra Assets"
          value={extraCount}
          color="var(--color-extra)"
          indicatorColor="var(--color-extra)"
          description="Active live but unregistered in CMDB"
        />
        <StatCard
          title="Naming Mismatches"
          value={mismatchCount}
          color="var(--color-mismatch)"
          indicatorColor="var(--color-mismatch)"
          description="Asset IDs match but names differ"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ marginBottom: "40px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--text-main)",
            marginBottom: "20px",
            letterSpacing: "-0.5px",
          }}
        >
          Reconciliation Analytics
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Pie Chart Card */}
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              minHeight: "380px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
              Discrepancy Breakdown
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Current run metrics
            </p>
            {!activeRun ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
                <span style={{ fontSize: "40px", marginBottom: "12px" }}>📊</span>
                <p style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>No Active Data</p>
                <p style={{ maxWidth: "240px", fontSize: "12px" }}>Upload inventory files to analyze discrepancy types.</p>
              </div>
            ) : (missingCount + extraCount + mismatchCount === 0) ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
                <span style={{ fontSize: "40px", marginBottom: "12px" }}>✅</span>
                <p style={{ fontWeight: "600", color: "var(--color-success)", marginBottom: "4px" }}>Clean Run</p>
                <p style={{ maxWidth: "240px", fontSize: "12px" }}>Zero discrepancies detected! All assets are fully matched.</p>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Missing Assets", value: missingCount, color: "var(--color-missing)" },
                        { name: "Extra Assets", value: extraCount, color: "var(--color-extra)" },
                        { name: "Naming Mismatches", value: mismatchCount, color: "var(--color-mismatch)" }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[
                        { name: "Missing Assets", value: missingCount, color: "var(--color-missing)" },
                        { name: "Extra Assets", value: extraCount, color: "var(--color-extra)" },
                        { name: "Naming Mismatches", value: mismatchCount, color: "var(--color-mismatch)" }
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "8px 12px", boxShadow: "var(--shadow-md)", fontSize: "12px" }}>
                              <p style={{ fontWeight: "700", color: data.color }}>{data.name}</p>
                              <p style={{ fontWeight: "600", color: "var(--text-main)" }}>Count: {data.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Trend Line Chart Card */}
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              minHeight: "380px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
              Discrepancy Trend
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Total issues across last 10 runs
            </p>
            {history.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
                <span style={{ fontSize: "40px", marginBottom: "12px" }}>📈</span>
                <p style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>No History Available</p>
                <p style={{ maxWidth: "240px", fontSize: "12px" }}>Historical trend will populate as you perform audits.</p>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...history]
                      .slice(0, 10)
                      .reverse()
                      .map(run => ({
                        name: new Date(run.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }),
                        issues: (run.missing_count ?? 0) + (run.extra_count ?? 0) + (run.mismatch_count ?? 0)
                      }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="issues" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Risk Distribution Card */}
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              minHeight: "380px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
              Risk Distribution
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Reconciliation run risk profiles
            </p>
            {history.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
                <span style={{ fontSize: "40px", marginBottom: "12px" }}>🛡️</span>
                <p style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>No Risk Metrics</p>
                <p style={{ maxWidth: "240px", fontSize: "12px" }}>Upload reconciliation files to evaluate risk ratings.</p>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Low Risk",
                        count: history.filter(run => (run.gemini_risk_level?.toLowerCase() || "") === "low").length,
                        color: "var(--color-success)"
                      },
                      {
                        name: "Medium Risk",
                        count: history.filter(run => (run.gemini_risk_level?.toLowerCase() || "") === "medium").length,
                        color: "var(--color-extra)"
                      },
                      {
                        name: "High Risk",
                        count: history.filter(run => (run.gemini_risk_level?.toLowerCase() || "") === "high").length,
                        color: "var(--color-missing)"
                      }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} content={<CustomBarTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {[
                        { color: "var(--color-success)" },
                        { color: "var(--color-extra)" },
                        { color: "var(--color-missing)" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Status Container */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--text-main)",
            margin: "0 0 16px 0",
            letterSpacing: "-0.5px",
          }}
        >
          Reconciliation Status Summary
        </h2>
        {activeRun ? (
          <div className="fade-in">
            <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "24px", lineHeight: "1.6" }}>
              {analysisResult 
                ? "A reconciliation run is currently active in memory. The system has calculated the following sync actions required:"
                : `Latest reconciliation run from PostgreSQL database (Run #${activeRun.id} created at ${new Date(activeRun.created_at).toLocaleString()}):`
              }
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-missing-bg)",
                  border: "1px solid var(--color-missing-border)",
                }}
              >
                <div style={{ fontWeight: "700", color: "var(--color-missing)", fontSize: "14px", marginBottom: "4px" }}>
                  Missing Assets ({missingCount})
                </div>
                <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.5" }}>
                  {missingCount === 0
                    ? "All CMDB assets are verified active in the live network."
                    : `Requires register cleanup or physical verification for ${missingCount} offline assets.`}
                </div>
              </div>

              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-extra-bg)",
                  border: "1px solid var(--color-extra-border)",
                }}
              >
                <div style={{ fontWeight: "700", color: "var(--color-extra)", fontSize: "14px", marginBottom: "4px" }}>
                  Extra Assets ({extraCount})
                </div>
                <div style={{ fontSize: "13px", color: "#7c2d12", lineHeight: "1.5" }}>
                  {extraCount === 0
                    ? "No unregistered network instances were found live."
                    : `Need to add ${extraCount} discovered live devices to the database registers.`}
                </div>
              </div>

              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-mismatch-bg)",
                  border: "1px solid var(--color-mismatch-border)",
                }}
              >
                <div style={{ fontWeight: "700", color: "var(--color-mismatch)", fontSize: "14px", marginBottom: "4px" }}>
                  Naming Mismatches ({mismatchCount})
                </div>
                <div style={{ fontSize: "13px", color: "#713f12", lineHeight: "1.5" }}>
                  {mismatchCount === 0
                    ? "Asset names align correctly across all environments."
                    : `Flagged name descriptors exist for ${mismatchCount} shared asset keys.`}
                </div>
              </div>
            </div>
            
            {/* If there's an active context scan, allow routing to detailed view tables */}
            {analysisResult && (
              <div style={{ display: "flex", gap: "16px" }}>
                <Link
                  to="/results"
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: "600",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.15)",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--primary-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "var(--primary)";
                  }}
                >
                  View Reconciliation Tables
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "12px 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "24px", lineHeight: "1.6" }}>
              No reconciliation analysis has been run in this session yet. Upload your inventory CSV (intended state) and live network JSON (active state) to check differences.
            </p>
            <Link
              to="/upload"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                borderRadius: "var(--radius-sm)",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.15)",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--primary)";
              }}
            >
              Upload Inventory Files
            </Link>
          </div>
        )}
      </div>

      {/* History table card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
          marginTop: "36px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "#fcfcfd",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text-main)",
              margin: 0,
              letterSpacing: "-0.25px",
            }}
          >
            Recent Reconciliation Runs
          </h3>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#ffffff",
              backgroundColor: "var(--primary)",
              padding: "4px 10px",
              borderRadius: "20px",
              lineHeight: "1.2",
            }}
          >
            {history.length} Runs
          </span>
        </div>
        <div style={{ padding: "0 24px" }}>
          {history.length === 0 ? (
            <div
              style={{
                padding: "32px 0",
                color: "var(--text-muted)",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              No historical audit runs found in the database.
            </div>
          ) : (
            <div style={{ overflowX: "auto", margin: "0 -24px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)" }}>Run ID</th>
                    <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)" }}>Timestamp</th>
                    <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)" }}>CMDB Assets</th>
                    <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)" }}>Live Assets</th>
                    <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)" }}>Discrepancies</th>
                    <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)" }}>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((run, idx) => {
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
                      <tr
                        key={run.id}
                        style={{
                          borderBottom: idx === history.length - 1 ? "none" : "1px solid var(--border-color)",
                          transition: "background-color var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td style={{ padding: "14px 24px", fontWeight: "600", color: "var(--text-main)" }}>#{run.id}</td>
                        <td style={{ padding: "14px 24px", color: "var(--text-muted)" }}>{new Date(run.created_at).toLocaleString()}</td>
                        <td style={{ padding: "14px 24px", fontWeight: "500" }}>{run.total_cmdb_assets}</td>
                        <td style={{ padding: "14px 24px", fontWeight: "500" }}>{run.total_live_assets}</td>
                        <td style={{ padding: "14px 24px" }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--color-missing-bg)", color: "var(--color-missing)", border: "1px solid var(--color-missing-border)", fontWeight: "600" }}>
                              {run.missing_count} Missing
                            </span>
                            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--color-extra-bg)", color: "var(--color-extra)", border: "1px solid var(--color-extra-border)", fontWeight: "600" }}>
                              {run.extra_count} Extra
                            </span>
                            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--color-mismatch-bg)", color: "var(--color-mismatch)", border: "1px solid var(--color-mismatch-border)", fontWeight: "600" }}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default Dashboard;