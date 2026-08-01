import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../../services/firebase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Auth mode: "signin" or "create"
  const initialMode = searchParams.get("mode") === "create" ? "create" : "signin";
  const [mode, setMode] = useState(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setInfoMessage("");
    setSearchParams({ mode: newMode });
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      setInfoMessage("");
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await api.post("/auth/login", {}, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Form Submit Handler (Email & Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      if (mode === "signin") {
        // --- SIGN IN MODE ---
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const token = await userCredential.user.getIdToken();
          await api.post("/auth/login", {}, { headers: { Authorization: `Bearer ${token}` } });
          navigate("/dashboard");
        } catch (err) {
          // If user not found on Sign In, auto-redirect to Create Account
          if (
            err.code === "auth/user-not-found" ||
            err.code === "auth/invalid-credential"
          ) {
            setInfoMessage("No account found with these credentials. Redirecting to Create Account...");
            setTimeout(() => {
              switchMode("create");
            }, 1200);
          } else {
            setError(err.message || "Sign-in failed. Please check your credentials.");
          }
        }
      } else {
        // --- CREATE ACCOUNT MODE ---
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (name.trim()) {
            await updateProfile(userCredential.user, { displayName: name.trim() });
          }
          const token = await userCredential.user.getIdToken();
          await api.post("/auth/login", {}, { headers: { Authorization: `Bearer ${token}` } });
          navigate("/dashboard");
        } catch (err) {
          // If email already exists on Create Account, auto-redirect to Sign In
          if (err.code === "auth/email-already-in-use") {
            setInfoMessage("Account already exists with this email. Redirecting to Sign In...");
            setTimeout(() => {
              switchMode("signin");
            }, 1200);
          } else {
            setError(err.message || "Could not create account. Please try again.");
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)", pointerEvents: "none" }} />

      {/* Back Home Button */}
      <Link
        to="/"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text2)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--forge)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text2)")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back home
      </Link>

      <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
        {/* Glow border */}
        <div style={{ position: "absolute", inset: -1, borderRadius: 24, background: "linear-gradient(135deg,rgba(99,102,241,0.4),transparent,rgba(6,182,212,0.25))", opacity: 0.7 }} />
        
        <div className="glass afu" style={{ position: "relative", borderRadius: 24, padding: 36, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="bg-forge-gradient glow-blue-sm" style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18 }}>M</span>
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 6px" }}>
              {mode === "signin" ? "Sign In to MockForge" : "Create Your Account"}
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 13, margin: 0 }}>
              {mode === "signin" ? "Enter your credentials to continue" : "Start your AI technical interview practice"}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", borderRadius: 12, background: "var(--bg2)", padding: 4, marginBottom: 20, border: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={() => switchMode("signin")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: mode === "signin" ? "var(--surface)" : "transparent",
                color: mode === "signin" ? "var(--text)" : "var(--text3)",
                boxShadow: mode === "signin" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.2s",
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => switchMode("create")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: mode === "create" ? "var(--surface)" : "transparent",
                color: mode === "create" ? "var(--text)" : "var(--text3)",
                boxShadow: mode === "create" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.2s",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "create" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", display: "block", marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", display: "block", marginBottom: 4 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", display: "block", marginBottom: 4 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-forge-gradient btn-press"
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 12,
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                marginTop: 6,
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
              }}
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Info Toast (Auto-Redirect Notification) */}
          {infoMessage && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, color: "var(--forge)", fontSize: 13, textAlign: "center", fontWeight: 600 }}>
              {infoMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "var(--red)", fontSize: 13, textAlign: "center" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text3)" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-press"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "11px 20px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          {/* Bottom Mode Switch Link */}
          <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("create")}
                  style={{ background: "none", border: "none", color: "var(--forge)", fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  style={{ background: "none", border: "none", color: "var(--forge)", fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
