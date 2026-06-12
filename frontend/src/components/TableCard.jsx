function TableCard({ title, badgeText, badgeBgColor, headers, data, renderRow, emptyMessage }) {
  return (
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
          {title}
        </h3>
        {badgeText !== undefined && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#ffffff",
              backgroundColor: badgeBgColor || "var(--primary)",
              padding: "4px 10px",
              borderRadius: "20px",
              lineHeight: "1.2",
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div style={{ padding: "0 24px" }}>
        {!data || data.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              color: "var(--text-muted)",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {emptyMessage || "No records found."}
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
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "14px 24px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom:
                        idx === data.length - 1
                          ? "none"
                          : "1px solid var(--border-color)",
                      transition: "background-color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {renderRow(item)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableCard;
