import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AnalysisContext } from "../context/AnalysisContext";
import PageContainer from "../components/PageContainer";
import LoadingSpinner from "../components/LoadingSpinner";

function Upload() {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [csvDragActive, setCsvDragActive] = useState(false);
  const [jsonDragActive, setJsonDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setAnalysisResult } = useContext(AnalysisContext);
  const navigate = useNavigate();

  const handleCsvDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCsvDragActive(true);
    } else if (e.type === "dragleave") {
      setCsvDragActive(false);
    }
  };

  const handleJsonDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setJsonDragActive(true);
    } else if (e.type === "dragleave") {
      setJsonDragActive(false);
    }
  };

  const handleCsvDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCsvDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        setCsvFile(file);
      } else {
        alert("Please upload a CSV file only.");
      }
    }
  };

  const handleJsonDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setJsonDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".json")) {
        setJsonFile(file);
      } else {
        alert("Please upload a JSON file only.");
      }
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleAnalyze = async () => {
    if (!csvFile || !jsonFile) {
      alert("Please select both files");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("csv_file", csvFile);
    formData.append("json_file", jsonFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        alert(`Analysis Error: ${data.error}`);
      } else {
        setAnalysisResult(data);
        navigate("/results");
      }
    } catch (error) {
      console.error(error);
      alert(`Backend connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
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
          <LoadingSpinner label="Reconciling inventory registers. Comparing database and active networks..." />
        </div>
      </PageContainer>
    );
  }

  const dropZoneStyle = (isActive) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "180px",
    border: `2px dashed ${isActive ? "var(--primary)" : "var(--border-color)"}`,
    borderRadius: "var(--radius-md)",
    backgroundColor: isActive ? "var(--primary-light)" : "var(--bg-main)",
    transition: "all var(--transition-normal)",
    cursor: "pointer",
    padding: "20px",
  });

  return (
    <PageContainer
      title="Upload Inventory Files"
      subtitle="Provide the intended database state (CSV) and the actual active live network environment state (JSON) to reconcile differences."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        {/* CSV Drop Zone */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
            Intended Inventory (CSV)
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
            Contains asset definitions registered in your CMDB. Should contain asset_id and asset_name.
          </p>

          {!csvFile ? (
            <label
              onDragEnter={handleCsvDrag}
              onDragOver={handleCsvDrag}
              onDragLeave={handleCsvDrag}
              onDrop={handleCsvDrop}
              style={dropZoneStyle(csvDragActive)}
            >
              <span style={{ fontSize: "36px", marginBottom: "12px" }}>📄</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                Drag & drop CSV here
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                or click to choose file
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && setCsvFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                backgroundColor: "var(--primary-light)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                <span style={{ fontSize: "24px" }}>✅</span>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {csvFile.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {formatSize(csvFile.size)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCsvFile(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* JSON Drop Zone */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
            Live Inventory (JSON)
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
            Extracted snapshot from your active live environment/monitoring tool containing active asset_id and asset_name.
          </p>

          {!jsonFile ? (
            <label
              onDragEnter={handleJsonDrag}
              onDragOver={handleJsonDrag}
              onDragLeave={handleJsonDrag}
              onDrop={handleJsonDrop}
              style={dropZoneStyle(jsonDragActive)}
            >
              <span style={{ fontSize: "36px", marginBottom: "12px" }}>⚙️</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                Drag & drop JSON here
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                or click to choose file
              </span>
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files && setJsonFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                backgroundColor: "var(--primary-light)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                <span style={{ fontSize: "24px" }}>✅</span>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {jsonFile.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {formatSize(jsonFile.size)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setJsonFile(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit/Analyze Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleAnalyze}
          disabled={!csvFile || !jsonFile}
          style={{
            padding: "14px 40px",
            backgroundColor: csvFile && jsonFile ? "var(--primary)" : "#cbd5e1",
            color: csvFile && jsonFile ? "#ffffff" : "#94a3b8",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: csvFile && jsonFile ? "pointer" : "not-allowed",
            boxShadow: csvFile && jsonFile ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            if (csvFile && jsonFile) e.target.style.backgroundColor = "var(--primary-hover)";
          }}
          onMouseLeave={(e) => {
            if (csvFile && jsonFile) e.target.style.backgroundColor = "var(--primary)";
          }}
        >
          Analyze and Reconcile
        </button>
      </div>
    </PageContainer>
  );
}

export default Upload;