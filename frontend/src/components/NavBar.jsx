import { NavLink } from "react-router-dom";

function NavBar() {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#38bdf8" : "#94a3b8",
    textDecoration: "none",
    fontWeight: isActive ? "600" : "500",
    fontSize: "16px",
    padding: "6px 12px",
    borderRadius: "4px",
    backgroundColor: isActive ? "#334155" : "transparent",
    transition: "all 0.2s ease-in-out",
  });

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 40px",
        backgroundColor: "#0f172a",
        borderBottom: "1px solid #334155",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          color: "#f8fafc",
          fontWeight: "700",
          fontSize: "20px",
          letterSpacing: "-0.5px",
        }}
      >
        IM-07 Reconciler
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <NavLink to="/" style={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/upload" style={linkStyle}>
          Upload
        </NavLink>
        <NavLink to="/results" style={linkStyle}>
          Results
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;
