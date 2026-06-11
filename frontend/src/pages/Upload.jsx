function Upload() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventory Reconciliation Upload</h1>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
        }}
      >
        <h3>Upload Intended Inventory (CSV)</h3>
        <input type="file" accept=".csv" />
      </div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
        }}
      >
        <h3>Upload Live Inventory (JSON)</h3>
        <input type="file" accept=".json" />
      </div>

      <button
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Analyze Inventory
      </button>
    </div>
  );
}

export default Upload;