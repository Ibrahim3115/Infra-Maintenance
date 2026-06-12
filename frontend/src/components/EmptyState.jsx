import { useState } from "react";

function EmptyState({ title, description, actionText, onAction, icon }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
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
        margin: "40px auto",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          fontSize: "56px",
          marginBottom: "20px",
          color: "var(--text-muted)",
          userSelect: "none",
        }}
      >
        {icon || "📊"}
      </div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "var(--text-main)",
          margin: "0 0 8px 0",
          letterSpacing: "-0.25px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-muted)",
          margin: "0 0 28px 0",
          maxWidth: "360px",
          lineHeight: "1.6",
        }}
      >
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: "12px 24px",
            backgroundColor: isHovered ? "var(--primary-hover)" : "var(--primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: isHovered
              ? "0 4px 12px rgba(37, 99, 235, 0.25)"
              : "0 2px 4px rgba(37, 99, 235, 0.15)",
            transition: "all var(--transition-fast)",
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
