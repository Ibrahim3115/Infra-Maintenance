function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>IM-07 Inventory Reconciliation Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ border: "1px solid #ccc", padding: "20px", width: "220px" }}>
          <h3>Total Assets</h3>
          <h2>0</h2>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "20px", width: "220px" }}>
          <h3>Missing Assets</h3>
          <h2>0</h2>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "20px", width: "220px" }}>
          <h3>Extra Assets</h3>
          <h2>0</h2>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "20px", width: "220px" }}>
          <h3>Naming Mismatches</h3>
          <h2>0</h2>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Recent Reconciliation Runs</h2>
        <p>No reconciliation runs yet.</p>
      </div>
    </div>
  );
}

export default Dashboard;