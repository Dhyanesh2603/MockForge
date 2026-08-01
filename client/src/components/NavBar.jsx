import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import BrandLogo from "./BrandLogo";

export default function NavBar({ showLogout = true, rightSlot = null }) {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const confirmLogout = async () => {
    try {
      setShowConfirmLogout(false);
      await signOut(auth);
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--surface)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo Emblem */}
          <BrandLogo size={32} />

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {user && (
              <>
                <Link
                  to="/adaptive"
                  className="btn-press"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(99,102,241,0.3)",
                    background: "rgba(99,102,241,0.08)",
                    color: "var(--forge)",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Adaptive Practice
                </Link>
                <Link
                  to="/coding/new"
                  className="btn-press"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(11,165,236,0.3)",
                    background: "rgba(11,165,236,0.08)",
                    color: "var(--forge)",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Coding Arena
                </Link>
                <Link
                  to="/clash"
                  className="btn-press"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(244,63,94,0.3)",
                    background: "rgba(244,63,94,0.08)",
                    color: "var(--red)",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  1v1 Clash
                </Link>
              </>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="theme-btn btn-press"
              title={dark ? "Switch to light" : "Switch to dark"}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>
                {dark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </span>
            </button>

            {user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 999,
                  padding: "4px 12px 4px 4px",
                }}
              >
                <div
                  className="bg-forge-gradient"
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {user.displayName?.[0] || "U"}
                </div>
                <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>
                  {user.displayName?.split(" ")[0]}
                </span>
              </div>
            )}

            {showLogout && user && (
              <button
                onClick={() => setShowConfirmLogout(true)}
                title="Sign out"
                className="btn-press"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color .2s, border-color .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--red)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text2)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="glass afu"
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              padding: 28,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
              Confirm Sign Out
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
              Are you sure you want to sign out of your MockForge session?
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="btn-press"
                style={{
                  flex: 1,
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="btn-press"
                style={{
                  flex: 1,
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "var(--red)",
                  border: "none",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
