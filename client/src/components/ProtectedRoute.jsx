import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard that redirects unauthenticated users to the homepage.
 * Wraps any route that requires a logged-in Firebase user.
 *
 * While Firebase auth state is loading, renders a minimal spinner
 * to avoid a flash of the redirect.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid var(--forge)",
              borderTopColor: "transparent",
              margin: "0 auto 12px",
              animation: "spin .7s linear infinite",
            }}
          />
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            Authenticating…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
