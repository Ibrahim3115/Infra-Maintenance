function Results() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Reconciliation Results</h1>

      <div style={{ marginTop: "30px" }}>
        <h2>Missing Assets</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Hostname</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SRV002</td>
              <td>db-server</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Extra Assets</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Hostname</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SRV003</td>
              <td>cache-server</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>AI Summary</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <p>
            Missing asset detected in live inventory. One unexpected asset
            found. Recommended action: verify inventory registration process.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Results;