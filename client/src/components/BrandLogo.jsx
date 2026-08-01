import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * BrandLogo — Sleek SVG Logo Emblem & Typography
 */
export default function BrandLogo({ size = 32, showText = true, to = null }) {
  const { user } = useAuth();
  const targetLink = to !== null ? to : (user ? "/dashboard" : "/");

  const logoIcon = (
    <div
      className="bg-forge-gradient"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 18px rgba(99, 102, 241, 0.45)",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Code Bracket & Neural Node Shield Emblem */}
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6L2 12l6 6" />
        <circle cx="12" cy="12" r="2.5" fill="#38bdf8" stroke="none" />
      </svg>
    </div>
  );

  if (!showText) return logoIcon;

  return (
    <Link
      to={targetLink}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      {logoIcon}
      <span
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: size * 0.58,
          color: "var(--text)",
          letterSpacing: "-0.02em",
        }}
      >
        Mock<span style={{ color: "var(--forge)" }}>Forge</span>
      </span>
    </Link>
  );
}
