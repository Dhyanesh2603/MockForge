import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import MotionIcon from "../common/MotionIcon";

export default function ProctoringAuditCard({ proctoringData }) {
  const score = proctoringData?.integrityScore ?? 100;
  const incidents = proctoringData?.incidents || [];

  const badgeColor =
    score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
  const badgeLabel =
    score >= 80 ? "High Integrity" : score >= 60 ? "Moderate Integrity" : "Low Trust Rating";

  return (
    <div
      className="glass"
      style={{
        borderRadius: 22,
        padding: 24,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MotionIcon icon={ShieldCheck} size={22} color="var(--forge)" animate="pulse" />
          <div>
            <h3
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Proctoring & Anti-Cheat Audit
            </h3>
            <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>
              Forge Guard real-time session monitor
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 999,
              background: `${badgeColor}18`,
              border: `1px solid ${badgeColor}40`,
              color: badgeColor,
            }}
          >
            {badgeLabel} · {score}%
          </span>
        </div>
      </div>

      {incidents.length > 0 ? (
        <div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text3)",
              marginBottom: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Flagged Session Incidents ({incidents.length})
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {incidents.map((inc, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 14px",
                  borderRadius: 12,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "monospace", color: "#f43f5e", fontWeight: 700 }}>
                    [{inc.timestamp}]
                  </span>
                  <span style={{ color: "var(--text2)", fontWeight: 500 }}>{inc.detail}</span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: "rgba(244,63,94,0.1)",
                    color: "#f43f5e",
                    fontWeight: 700,
                  }}
                >
                  {inc.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(52,211,153,0.06)",
            border: "1px solid rgba(52,211,153,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <MotionIcon icon={CheckCircle2} size={20} color="#34d399" />
          <p style={{ fontSize: 13, color: "var(--text2)", margin: 0 }}>
            Clean session! No tab switches, unusual noise, or suspicious events were detected.
          </p>
        </div>
      )}
    </div>
  );
}
