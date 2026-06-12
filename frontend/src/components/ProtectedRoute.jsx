import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PageContainer from "./PageContainer";
import LoadingSpinner from "./LoadingSpinner";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return (
      <PageContainer title="Security Verification">
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "40px",
            boxShadow: "var(--shadow-md)",
            maxWidth: "600px",
            margin: "40px auto",
          }}
        >
          <LoadingSpinner label="Verifying active session security tokens..." />
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
