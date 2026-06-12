import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AnalysisContext } from "../context/AnalysisContext";
import { AuthContext } from "../context/AuthContext";

function NavBar() {
  const { analysisResult, clearAnalysisResult } = useContext(AnalysisContext);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isClearHovered, setIsClearHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "var(--primary)" : "var(--text-muted)",
    textDecoration: "none",
    fontWeight: isActive ? "600" : "500",
    fontSize: "15px",
    padding: "8px 16px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: isActive ? "var(--primary-light)" : "transparent",
    transition: "all var(--transition-fast)",
  });

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all reconciliation results?")) {
      clearAnalysisResult();
      navigate("/");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      clearAnalysisResult();
      logout();
      navigate("/login");
    }
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 40px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color)",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => navigate(isAuthenticated ? "/" : "/login")}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "16px",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
          }}
        >
          IM
        </div>
        <div
          style={{
            color: "var(--text-main)",
            fontWeight: "700",
            fontSize: "18px",
            letterSpacing: "-0.5px",
          }}
        >
          Reconciler <span style={{ color: "var(--text-muted)", fontWeight: "400", fontSize: "14px" }}>IM-07</span>
        </div>
      </div>

      {isAuthenticated && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <NavLink to="/" style={linkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/upload" style={linkStyle}>
            Upload
          </NavLink>
          <NavLink to="/results" style={linkStyle}>
            Results
          </NavLink>
          <NavLink to="/history" style={linkStyle}>
            History
          </NavLink>
          
          {analysisResult && (
            <button
              onClick={handleClear}
              onMouseEnter={() => setIsClearHovered(true)}
              onMouseLeave={() => setIsClearHovered(false)}
              style={{
                marginLeft: "8px",
                padding: "8px 16px",
                backgroundColor: isClearHovered ? "var(--color-missing-bg)" : "transparent",
                color: "var(--color-missing)",
                border: "1px solid var(--color-missing-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              Clear Results
            </button>
          )}

          {/* User Profile avatar info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "16px",
              paddingLeft: "16px",
              borderLeft: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "12px",
                border: "1px solid rgba(37, 99, 235, 0.15)",
                userSelect: "none",
              }}
            >
              {user?.username ? user.username.substring(0, 2).toUpperCase() : "US"}
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-main)",
                marginRight: "8px",
              }}
            >
              {user?.username || "User"}
            </span>
            <button
              onClick={handleLogout}
              onMouseEnter={() => setIsLogoutHovered(true)}
              onMouseLeave={() => setIsLogoutHovered(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: isLogoutHovered ? "var(--color-missing)" : "transparent",
                color: isLogoutHovered ? "#ffffff" : "var(--text-muted)",
                border: isLogoutHovered ? "1px solid var(--color-missing)" : "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
