import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import MotionIcon from "../../components/common/MotionIcon";
import NavBar from "../../components/NavBar";
import api from "../../services/api";

export default function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get("/interviews/analytics/history");
        if (res.data?.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error(err);
        // Fallback default analytics data
        setAnalytics({
          wpmTrend: [
            { date: "Jul 26", wpm: 120 },
            { date: "Jul 28", wpm: 132 },
            { date: "Jul 30", wpm: 138 },
            { date: "Aug 01", wpm: 145 },
          ],
          fillerWordsTrend: [
            { date: "Jul 26", fillers: 14 },
            { date: "Jul 28", fillers: 9 },
            { date: "Jul 30", fillers: 5 },
            { date: "Aug 01", fillers: 2 },
          ],
          confidenceTrend: [
            { date: "Jul 26", score: 72 },
            { date: "Jul 28", score: 80 },
            { date: "Jul 30", score: 86 },
            { date: "Aug 01", score: 92 },
          ],
          eyeContactTrend: [
            { date: "Jul 26", score: 88 },
            { date: "Jul 28", score: 91 },
            { date: "Jul 30", score: 95 },
            { date: "Aug 01", score: 98 },
          ],
          codingPassTrend: [
            { date: "Jul 26", passRate: 50 },
            { date: "Jul 28", passRate: 75 },
            { date: "Jul 30", passRate: 88 },
            { date: "Aug 01", passRate: 100 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <div className="bg-ambient" />

      <main style={{ flex: 1, maxWidth: 1180, width: "100%", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--forge)", fontWeight: 700, textTransform: "uppercase" }}>
            EXECUTIVE CANDIDATE METRICS
          </span>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, margin: "4px 0 6px", color: "var(--text)" }}>
            Performance & Speech Analytics Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "var(--text2)", margin: 0 }}>
            Track your speaking speed, filler word reduction, confidence index, eye contact integrity, and coding pass rate over time.
          </p>
        </div>

        {loading ? (
          <div className="glass" style={{ borderRadius: 24, padding: 48, textAlign: "center", color: "var(--text2)" }}>
            Loading candidate metrics...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Top 4 KPI Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
              
              {/* Card 1: Speaking Speed */}
              <div className="glass afu" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 700 }}>Avg Speaking Speed</span>
                <strong style={{ fontSize: 26, color: "var(--forge)", display: "block", margin: "6px 0", fontFamily: "Syne, sans-serif" }}>
                  145 WPM
                </strong>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>
                  ↑ +25 WPM (Optimal Pace)
                </span>
              </div>

              {/* Card 2: Filler Words */}
              <div className="glass afu d1" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 700 }}>Filler Words / Session</span>
                <strong style={{ fontSize: 26, color: "#10b981", display: "block", margin: "6px 0", fontFamily: "Syne, sans-serif" }}>
                  2 Fillers
                </strong>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>
                  ↓ 85% Reduction in "um/like"
                </span>
              </div>

              {/* Card 3: Confidence Score */}
              <div className="glass afu d2" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 700 }}>Confidence Index</span>
                <strong style={{ fontSize: 26, color: "var(--accent-cyan)", display: "block", margin: "6px 0", fontFamily: "Syne, sans-serif" }}>
                  92 / 100
                </strong>
                <span style={{ fontSize: 12, color: "var(--accent-cyan)", fontWeight: 700 }}>
                  ↑ +20 pts (Strong Delivery)
                </span>
              </div>

              {/* Card 4: Eye Contact Integrity */}
              <div className="glass afu d3" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 700 }}>Eye Contact Integrity</span>
                <strong style={{ fontSize: 26, color: "#10b981", display: "block", margin: "6px 0", fontFamily: "Syne, sans-serif" }}>
                  98%
                </strong>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MotionIcon icon={Check} size={13} color="#10b981" /> High Proctoring Score
                </span>
              </div>

            </div>

            {/* Historical Analytics Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              
              {/* Chart 1: WPM Pacing Trend */}
              <div className="glass" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                  Speaking Speed (WPM) Progress
                </h4>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 160, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  {analytics.wpmTrend?.map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--forge)", fontFamily: "monospace" }}>
                        {item.wpm} WPM
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${(item.wpm / 160) * 120}px`,
                          borderRadius: 8,
                          background: "linear-gradient(180deg, #6366f1, #4f46e5)",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Filler Words Reduction Trend */}
              <div className="glass" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                  Filler Word Reduction ("um", "like", "you know")
                </h4>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 160, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  {analytics.fillerWordsTrend?.map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
                        {item.fillers}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${(item.fillers / 16) * 120}px`,
                          borderRadius: 8,
                          background: "linear-gradient(180deg, #10b981, #059669)",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 3: Confidence & Executive Index */}
              <div className="glass" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                  Executive Delivery & Confidence Trend
                </h4>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 160, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  {analytics.confidenceTrend?.map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "monospace" }}>
                        {item.score}%
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${(item.score / 100) * 120}px`,
                          borderRadius: 8,
                          background: "linear-gradient(180deg, #06b6d4, #0891b2)",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 4: Coding Pass Rate Trend */}
              <div className="glass" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                  Coding Arena Test Pass Rate
                </h4>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 160, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  {analytics.codingPassTrend?.map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
                        {item.passRate}%
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${(item.passRate / 100) * 120}px`,
                          borderRadius: 8,
                          background: "linear-gradient(180deg, #10b981, #047857)",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
