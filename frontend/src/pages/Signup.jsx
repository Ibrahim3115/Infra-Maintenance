import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PageContainer from "../components/PageContainer";
import LoadingSpinner from "../components/LoadingSpinner";

function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      await signup(username, email, password);
      setSuccess("Account successfully registered! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Try a different username/email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Platform Registration">
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
              Create Account
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Join the IM-07 Inventory Reconciliation Platform
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

          {success && (
            <div
              style={{
                backgroundColor: "var(--color-success-bg)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                color: "var(--color-success)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 16px",
                fontSize: "13px",
                marginBottom: "24px",
                fontWeight: "500",
                lineHeight: "1.5",
              }}
            >
              🎉 {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
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
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
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
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }}
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
                placeholder="Choose strong password"
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
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
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
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }}
              />
            </div>

            {isLoading ? (
              <div style={{ padding: "10px 0" }}>
                <LoadingSpinner label="Creating credentials..." />
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
                Register Account
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
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default Signup;
