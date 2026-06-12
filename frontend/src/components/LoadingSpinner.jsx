function LoadingSpinner({ label }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e2e8f0",
          borderTop: "4px solid var(--primary)",
          borderRadius: "50%",
          marginBottom: "20px",
        }}
      ></div>
      {label && (
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "15px",
            fontWeight: "500",
            letterSpacing: "-0.1px",
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
