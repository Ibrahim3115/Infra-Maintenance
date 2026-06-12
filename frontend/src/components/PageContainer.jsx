function PageContainer({ children, title, subtitle, action }) {
  return (
    <div
      className="fade-in"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {(title || subtitle || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "32px",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1" }}>
            {title && (
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "var(--text-main)",
                  margin: 0,
                  letterSpacing: "-0.75px",
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  margin: "8px 0 0 0",
                  fontWeight: "400",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default PageContainer;
