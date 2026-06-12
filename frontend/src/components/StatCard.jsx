import { useState } from "react";

function StatCard({ title, value, color, description, indicatorColor }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderLeft: `4px solid ${indicatorColor || color || "var(--primary)"}`,
        borderRadius: "var(--radius-md)",
        padding: "24px",
        minWidth: "200px",
        flex: "1 1 200px",
        boxShadow: isHovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all var(--transition-normal)",
        cursor: "default",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "12px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "36px",
          fontWeight: "800",
          color: color || "var(--text-main)",
          lineHeight: "1.1",
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      {description && (
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginTop: "12px",
            fontWeight: "400",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

export default StatCard;
