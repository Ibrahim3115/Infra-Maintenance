import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnalysisContext } from "../context/AnalysisContext";
import { AuthContext } from "../context/AuthContext";
import PageContainer from "../components/PageContainer";
import TableCard from "../components/TableCard";
import EmptyState from "../components/EmptyState";

// ─── Suggestion chips shown before the first message ─────────────────────────
const SUGGESTION_CHIPS = [
  "Why is this audit high risk?",
  "What should I do about missing assets?",
  "Explain the naming mismatches.",
  "What are the recommended actions?",
  "Is this environment critical?",
];

// ─── Copilot Chat Panel ───────────────────────────────────────────────────────
function CopilotPanel({ runId, token }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your **AI Infrastructure Copilot**. Ask me anything about this reconciliation audit — discrepancies, risk level, or remediation steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/copilot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ run_id: runId, question: q }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to get a response.");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ ${err.message || "An error occurred. Please try again."}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown-lite: bold (**text**) and bullet lists
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Render bullet lines
      const lines = part.split("\n");
      return (
        <span key={i}>
          {lines.map((line, j) => {
            if (line.trimStart().startsWith("- ")) {
              return (
                <span key={j} style={{ display: "block", paddingLeft: "16px", position: "relative" }}>
                  <span style={{ position: "absolute", left: "4px", color: "var(--primary)" }}>•</span>
                  {line.trimStart().slice(2)}
                </span>
              );
            }
            return (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            );
          })}
        </span>
      );
    });
  };

  const showSuggestions = messages.length === 1;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        marginBottom: "36px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-color)",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        }}
      >
        <span style={{ fontSize: "20px" }}>🤖</span>
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.25px",
            }}
          >
            AI Infrastructure Copilot
          </h3>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", margin: 0, marginTop: "2px" }}>
            Powered by Google Gemini · Context-aware audit assistant
          </p>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: "600",
            color: "#4ade80",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#4ade80",
              boxShadow: "0 0 6px #4ade80",
            }}
          />
          ONLINE
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          padding: "20px 24px",
          minHeight: "240px",
          maxHeight: "420px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          backgroundColor: "#fafbfc",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  flexShrink: 0,
                  marginRight: "10px",
                  marginTop: "2px",
                  boxShadow: "0 2px 6px rgba(79,70,229,0.35)",
                }}
              >
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                backgroundColor: msg.role === "user"
                  ? "var(--primary)"
                  : msg.isError
                  ? "var(--color-missing-bg)"
                  : "#ffffff",
                color: msg.role === "user" ? "#ffffff" : msg.isError ? "var(--color-missing)" : "var(--text-main)",
                fontSize: "13.5px",
                lineHeight: "1.65",
                fontWeight: "500",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                border: msg.role === "assistant" && !msg.isError ? "1px solid var(--border-color)" : "none",
              }}
            >
              {renderText(msg.text)}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(79,70,229,0.35)",
              }}
            >
              🤖
            </div>
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "4px 18px 18px 18px",
                backgroundColor: "#ffffff",
                border: "1px solid var(--border-color)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                gap: "5px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        {showSuggestions && !loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(79,70,229,0.3)",
                  backgroundColor: "rgba(79,70,229,0.06)",
                  color: "var(--primary)",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(79,70,229,0.14)";
                  e.target.style.borderColor = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(79,70,229,0.06)";
                  e.target.style.borderColor = "rgba(79,70,229,0.3)";
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "#ffffff",
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
        }}
      >
        <textarea
          id="copilot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this audit... (Press Enter to send)"
          rows={1}
          disabled={loading || !runId}
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            fontSize: "13.5px",
            fontFamily: "inherit",
            color: "var(--text-main)",
            backgroundColor: loading ? "#f5f5f5" : "#fafbfc",
            outline: "none",
            transition: "border-color 0.15s ease",
            lineHeight: "1.5",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim() || !runId}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            backgroundColor: loading || !input.trim() || !runId ? "#e5e7eb" : "var(--primary)",
            color: loading || !input.trim() || !runId ? "var(--text-muted)" : "#ffffff",
            fontSize: "14px",
            fontWeight: "700",
            cursor: loading || !input.trim() || !runId ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            letterSpacing: "0.2px",
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim() && runId) e.target.style.backgroundColor = "var(--primary-hover)";
          }}
          onMouseLeave={(e) => {
            if (!loading && input.trim() && runId) e.target.style.backgroundColor = "var(--primary)";
          }}
        >
          {loading ? "Thinking…" : "Ask ↵"}
        </button>
      </div>

      {!runId && (
        <div
          style={{
            padding: "10px 24px",
            backgroundColor: "var(--color-missing-bg)",
            borderTop: "1px solid var(--color-missing-border)",
            fontSize: "12px",
            color: "var(--color-missing)",
            fontWeight: "600",
          }}
        >
          ⚠ This run was not saved to the database. Copilot is unavailable without a Run ID.
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

function Results() {
  const { analysisResult, clearAnalysisResult } = useContext(AnalysisContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const getFallbackInsights = (result) => {
    const missingCount = result.missing_assets?.length ?? 0;
    const extraCount = result.extra_assets?.length ?? 0;
    const mismatchCount = result.naming_mismatches?.length ?? 0;
    const totalDiscrepancies = missingCount + extraCount + mismatchCount;
    const cmdbCount = result.total_cmdb_assets ?? 0;
    const liveCount = result.total_live_assets ?? 0;

    if (totalDiscrepancies === 0) {
      return {
        executive_summary: `Inventory reconciliation completed successfully. Both the CMDB registry (${cmdbCount} assets) and the live environment (${liveCount} assets) are perfectly aligned. No discrepancies were detected.`,
        risk_level: "Low",
        root_cause_analysis: "Infrastructure registers are fully synchronized with active environments. Systems are operating in a healthy state.",
        recommended_actions: [
          "Maintain current inventory reporting and verification frequency.",
          "Continue enforcing automated configuration management checks."
        ]
      };
    } else if (totalDiscrepancies > 5) {
      return {
        executive_summary: `Critical inventory discrepancies detected: ${missingCount} missing, ${extraCount} extra, and ${mismatchCount} naming mismatches. Immediate corrective action is recommended to align CMDB logs with active network assets.`,
        risk_level: "High",
        root_cause_analysis: "Potential breakdown in the provisioning or decommissioning change management pipeline. Unregistered virtual machines or active services may have been started without standard configuration logs, or offline systems were not cleaned up from CMDB logs.",
        recommended_actions: [
          "Perform immediate forensic auditing on the unregistered extra assets.",
          "Re-verify if the missing assets are decommissioned or experiencing connectivity issues.",
          "Standardize asset registration procedures within the deployment pipeline."
        ]
      };
    } else {
      return {
        executive_summary: `Moderate inventory discrepancies detected: ${missingCount} missing, ${extraCount} extra, and ${mismatchCount} naming mismatches. Standard maintenance review is advised.`,
        risk_level: "Medium",
        root_cause_analysis: "Minor synchronization lag between active environment configuration registers and live tracking systems. This is typically caused by batch synchronization cycles or minor naming updates not fully propagating.",
        recommended_actions: [
          "Audit naming mismatches and synchronize live hostnames with CMDB registers.",
          "Verify network reachability for missing hostnames.",
          "Update registry entries for verified extra assets."
        ]
      };
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all reconciliation results?")) {
      clearAnalysisResult();
      navigate("/");
    }
  };

  if (!analysisResult) {
    return (
      <PageContainer title="Reconciliation Results">
        <EmptyState
          title="No Results Available"
          description="You haven't uploaded state inventory files for processing yet."
          actionText="Go to Upload"
          onAction={() => navigate("/upload")}
          icon="🔍"
        />
      </PageContainer>
    );
  }

  const aiAnalysis = analysisResult.gemini_analysis || getFallbackInsights(analysisResult);

  let riskColor = "var(--text-muted)";
  let riskBg = "var(--border-color)";
  let riskBorder = "var(--border-color)";

  const risk = aiAnalysis?.risk_level?.toLowerCase() || "";
  if (risk === "low") {
    riskColor = "var(--color-success)";
    riskBg = "var(--color-success-bg)";
    riskBorder = "rgba(34, 197, 94, 0.2)";
  } else if (risk === "medium") {
    riskColor = "var(--color-extra)";
    riskBg = "var(--color-extra-bg)";
    riskBorder = "var(--color-extra-border)";
  } else if (risk === "high") {
    riskColor = "var(--color-missing)";
    riskBg = "var(--color-missing-bg)";
    riskBorder = "var(--color-missing-border)";
  }

  const handleDownloadReport = () => {
    if (!analysisResult.id) {
      alert("No database Run ID found for this audit. Make sure the run was successfully saved.");
      return;
    }
    window.open(`http://127.0.0.1:8000/report/${analysisResult.id}?token=${token}`, "_blank");
  };

  const headerActions = (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      {analysisResult.id && (
        <button
          onClick={handleDownloadReport}
          style={{
            padding: "10px 18px",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
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
          Download PDF Report
        </button>
      )}
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
    </div>
  );

  return (
    <PageContainer
      title="Reconciliation Results"
      subtitle="Audited lists of differences discovered between configuration logs and active environments"
      action={headerActions}
    >
      <div className="fade-in">
        {/* Run Metadata Banner */}
        {analysisResult.id && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "var(--primary-light)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "12px 24px",
              marginBottom: "24px",
              fontSize: "14px",
              color: "var(--primary)",
              fontWeight: "600",
            }}
          >
            <span>Reconciliation Audit Run ID: #{analysisResult.id}</span>
            <span>Audited At: {new Date(analysisResult.created_at).toLocaleString()}</span>
          </div>
        )}
        {/* AI Insights Card */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "#fcfcfd",
            }}
          >
            <span style={{ fontSize: "18px" }}>✨</span>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text-main)",
                margin: 0,
                letterSpacing: "-0.25px",
              }}
            >
              Gemini AI Infrastructure Insights
            </h3>
          </div>
          <div style={{ padding: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "32px",
              }}
            >
              {/* Left Side: Summary & Risk */}
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "10px",
                    }}
                  >
                    Risk Assessment
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      backgroundColor: riskBg,
                      color: riskColor,
                      border: `1px solid ${riskBorder}`,
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: riskColor,
                      }}
                    />
                    {aiAnalysis.risk_level} Risk
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "10px",
                    }}
                  >
                    Executive Summary
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-main)",
                      lineHeight: "1.6",
                      fontWeight: "500",
                      margin: 0,
                    }}
                  >
                    {aiAnalysis.executive_summary}
                  </p>
                </div>
              </div>

              {/* Right Side: Root Cause & Actions */}
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "10px",
                    }}
                  >
                    Root Cause Analysis
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {aiAnalysis.root_cause_analysis}
                  </p>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "10px",
                    }}
                  >
                    Recommended Actions
                  </div>
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {aiAnalysis.recommended_actions?.map((action, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: "13.5px",
                          color: "var(--text-main)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "10px",
                          lineHeight: "1.5",
                        }}
                      >
                        <span
                          style={{
                            color: riskColor,
                            fontWeight: "bold",
                            fontSize: "16px",
                            lineHeight: "1",
                            marginTop: "-1px",
                          }}
                        >
                          •
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Copilot Chat Panel */}
        <CopilotPanel runId={analysisResult.id || null} token={token} />

        {/* Missing Assets Table */}
        <TableCard
          title="Missing Assets"
          badgeText={analysisResult.missing_assets?.length ?? 0}
          badgeBgColor="var(--color-missing)"
          headers={["Asset ID", "Intended Hostname", "Status Flag"]}
          data={analysisResult.missing_assets}
          emptyMessage="No missing assets detected. Live environment matches configuration registers."
          renderRow={(asset) => (
            <>
              <td style={{ padding: "14px 24px", fontWeight: "600", color: "var(--color-missing)" }}>
                {asset.asset_id}
              </td>
              <td style={{ padding: "14px 24px", color: "var(--text-muted)", fontWeight: "500" }}>
                {asset.asset_name || asset.hostname || "N/A"}
              </td>
              <td style={{ padding: "14px 24px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "4px 8px",
                    backgroundColor: "var(--color-missing-bg)",
                    color: "var(--color-missing)",
                    border: "1px solid var(--color-missing-border)",
                    borderRadius: "12px",
                    fontWeight: "700",
                  }}
                >
                  Missing Offline
                </span>
              </td>
            </>
          )}
        />

        {/* Extra Assets Table */}
        <TableCard
          title="Extra Live Assets"
          badgeText={analysisResult.extra_assets?.length ?? 0}
          badgeBgColor="var(--color-extra)"
          headers={["Asset ID", "Discovered Hostname", "Status Flag"]}
          data={analysisResult.extra_assets}
          emptyMessage="No unexpected live assets found running."
          renderRow={(asset) => (
            <>
              <td style={{ padding: "14px 24px", fontWeight: "600", color: "var(--color-extra)" }}>
                {asset.asset_id}
              </td>
              <td style={{ padding: "14px 24px", color: "var(--text-muted)", fontWeight: "500" }}>
                {asset.asset_name || asset.hostname || "N/A"}
              </td>
              <td style={{ padding: "14px 24px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "4px 8px",
                    backgroundColor: "var(--color-extra-bg)",
                    color: "var(--color-extra)",
                    border: "1px solid var(--color-extra-border)",
                    borderRadius: "12px",
                    fontWeight: "700",
                  }}
                >
                  Unregistered Live
                </span>
              </td>
            </>
          )}
        />

        {/* Naming Mismatches Table */}
        <TableCard
          title="Naming Mismatches"
          badgeText={analysisResult.naming_mismatches?.length ?? 0}
          badgeBgColor="var(--color-mismatch)"
          headers={["Asset ID", "CMDB Name", "Live Name", "Status Flag"]}
          data={analysisResult.naming_mismatches}
          emptyMessage="No name mismatches detected on common identifiers."
          renderRow={(mismatch) => (
            <>
              <td style={{ padding: "14px 24px", fontWeight: "600", color: "var(--text-main)" }}>
                {mismatch.asset_id}
              </td>
              <td style={{ padding: "14px 24px" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    backgroundColor: "var(--color-missing-bg)",
                    color: "var(--color-missing)",
                    border: "1px solid var(--color-missing-border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {mismatch.cmdb_name}
                </div>
              </td>
              <td style={{ padding: "14px 24px" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    backgroundColor: "var(--color-success-bg)",
                    color: "var(--color-success)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {mismatch.live_name}
                </div>
              </td>
              <td style={{ padding: "14px 24px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "4px 8px",
                    backgroundColor: "var(--color-mismatch-bg)",
                    color: "var(--color-mismatch)",
                    border: "1px solid var(--color-mismatch-border)",
                    borderRadius: "12px",
                    fontWeight: "700",
                  }}
                >
                  Conflict
                </span>
              </td>
            </>
          )}
        />

        {/* System Summary Card */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            padding: "28px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            lineHeight: "1.6",
          }}
        >
          <h3
            style={{
              color: "var(--text-main)",
              marginTop: 0,
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            Auditing Summary Notes
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Reconciled <strong>{analysisResult.total_cmdb_assets}</strong> registered items against{" "}
            <strong>{analysisResult.total_live_assets}</strong> live endpoints. There are currently{" "}
            <strong>{analysisResult.missing_assets?.length ?? 0}</strong> offline failures,{" "}
            <strong>{analysisResult.extra_assets?.length ?? 0}</strong> unknown instances, and{" "}
            <strong>{analysisResult.naming_mismatches?.length ?? 0}</strong> naming configuration errors. Use these tables
            to run inventory corrections.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

export default Results;