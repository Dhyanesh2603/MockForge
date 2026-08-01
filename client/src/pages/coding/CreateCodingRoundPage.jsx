import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavBar from "../../components/NavBar";

const SUGGESTED_TOPICS = [
  { id: "arrays", name: "Arrays & Hashing", desc: "Two Sum, Anagrams, Subarray Sum" },
  { id: "dp", name: "Dynamic Programming", desc: "Climbing Stairs, Coin Change, Knapsack" },
  { id: "pointers", name: "Two Pointers & Sliding Window", desc: "Container With Most Water, Substrings" },
  { id: "trees", name: "Trees & Graphs", desc: "Binary Tree Traversal, BFS/DFS, Invert Tree" },
  { id: "strings", name: "String Manipulation", desc: "Reverse Words, Palindromes, Matching" },
  { id: "system", name: "System Logic & Algorithms", desc: "LRU Cache, Rate Limiter, Binary Search" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [1, 3, 5];

export default function CreateCodingRoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("arrays");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(3);
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeTopic = customTopic.trim() || selectedTopic;

  const handleStartCoding = async () => {
    setLoading(true);
    setError("");

    try {
      let challenges = [];

      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await api.post(
            "/interviews/coding/generate",
            {
              topic: activeTopic,
              difficulty,
              numQuestions: Number(numQuestions),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data.challenges) {
            challenges = res.data.challenges;
          }
        } catch (apiErr) {
          console.warn("AI generation API fallback:", apiErr);
        }
      }

      const roundId = "code-" + Date.now().toString(36);
      navigate(`/coding/${roundId}`, {
        state: {
          topic: activeTopic,
          difficulty,
          numQuestions: Number(numQuestions),
          language,
          challenges,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate coding round. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar />

        <main style={{ maxWidth: 840, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>
              Dedicated Coding Round Platform
            </span>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,2.8rem)", background: "linear-gradient(135deg,#818cf8,#6366f1,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "10px 0 12px" }}>
              Configure AI Coding Practice Round
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
              Type any custom topic or select a domain below. AI will generate dynamic problems with sample test cases and secured hidden test cases.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 28 }}>
            
            {/* Custom Topic Input */}
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                1. Custom Topic / Subject <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 400 }}>(e.g. Binary Search Trees, Graph Algorithms, System Logic)</span>
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Type ANY custom topic (e.g. Sliding Window, Trie, Dynamic Programming)..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "var(--bg2)",
                  color: "var(--text)",
                  padding: "12px 16px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {/* Suggested Domains */}
            {!customTopic.trim() && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 10 }}>
                  Or Choose a Suggested Domain:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {SUGGESTED_TOPICS.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        cursor: "pointer",
                        border: selectedTopic === t.id ? "1.5px solid var(--forge)" : "1px solid var(--border)",
                        background: selectedTopic === t.id ? "rgba(var(--forge-rgb),.1)" : "var(--bg2)",
                        transition: "all 0.2s",
                      }}
                    >
                      <h4 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: selectedTopic === t.id ? "var(--forge)" : "var(--text)" }}>
                        {t.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--text3)" }}>{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                2. Select Difficulty
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 14,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: difficulty === d ? "none" : "1px solid var(--border)",
                      background: difficulty === d
                        ? d === "Easy" ? "#10b981" : d === "Medium" ? "#f59e0b" : "#ef4444"
                        : "var(--bg2)",
                      color: difficulty === d ? "#fff" : "var(--text2)",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions & Language */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                  3. Number of Challenges
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {QUESTION_COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumQuestions(n)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: numQuestions === n ? "none" : "1px solid var(--border)",
                        background: numQuestions === n ? "var(--forge)" : "var(--bg2)",
                        color: numQuestions === n ? "#fff" : "var(--text2)",
                      }}
                    >
                      {n} Question{n > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                  4. Primary Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="python">Python 3.11</option>
                  <option value="cpp">C++ 20 (GCC)</option>
                  <option value="java">Java 21 (OpenJDK)</option>
                </select>
              </div>
            </div>

            {error && <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>{error}</p>}

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartCoding}
              disabled={loading}
              className="bg-forge-gradient btn-press"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 30px rgba(var(--forge-rgb),.3)",
                marginTop: 8,
              }}
            >
              {loading ? "⚡ Generating AI Coding Challenges..." : "🚀 Launch AI Coding Arena"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
