import { useState } from "react";

function Upload() {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!csvFile || !jsonFile) {
      alert("Please select both files");
      return;
    }

    const formData = new FormData();
    formData.append("csv_file", csvFile);
    formData.append("json_file", jsonFile);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventory Reconciliation Upload</h1>

      <div style={{ marginTop: "20px" }}>
        <h3>Upload Intended Inventory (CSV)</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Upload Live Inventory (JSON)</h3>
        <input
          type="file"
          accept=".json"
          onChange={(e) => setJsonFile(e.target.files[0])}
        />
      </div>

      <button
        onClick={handleAnalyze}
        style={{ marginTop: "20px" }}
      >
        Analyze Inventory
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Upload;