import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PageContainer from "../components/PageContainer";
import LoadingSpinner from "../components/LoadingSpinner";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username/email and password.");
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Platform Authentication">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            padding: "40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                marginBottom: "16px",
              }}
            >
              IM
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.75px", margin: "0 0 6px 0" }}>
              Sign In
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Access the IM-07 Inventory Reconciliation Tool
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "var(--color-missing-bg)",
                border: "1px solid var(--color-missing-border)",
                color: "var(--color-missing)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 16px",
                fontSize: "13px",
                marginBottom: "24px",
                fontWeight: "500",
                lineHeight: "1.5",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                }}
              />
            </div>

            {isLoading ? (
              <div style={{ padding: "10px 0" }}>
                <LoadingSpinner label="Authenticating session..." />
              </div>
            ) : (
              <button
                type="submit"
                onMouseEnter={() => setIsSubmitHovered(true)}
                onMouseLeave={() => setIsSubmitHovered(false)}
                style={{
                  padding: "14px 24px",
                  backgroundColor: isSubmitHovered ? "var(--primary-hover)" : "var(--primary)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: isSubmitHovered
                    ? "0 4px 12px rgba(37, 99, 235, 0.25)"
                    : "0 2px 4px rgba(37, 99, 235, 0.15)",
                  transition: "all var(--transition-fast)",
                  marginTop: "8px",
                }}
              >
                Sign In
              </button>
            )}
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "28px",
              fontSize: "14px",
              color: "var(--text-muted)",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "20px",
            }}
          >
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default Login;
