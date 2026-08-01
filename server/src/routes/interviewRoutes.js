import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createInterviewSession,
  fetchUserInterviews,
} from "../controllers/interviewController.js";

import {
  getInterviewDetails,
} from "../controllers/interviewDetailsController.js";

import {
  generateCodingChallenge,
  generateAdaptiveNextQuestion,
  generateSwotAnalysis,
} from "../services/geminiService.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createInterviewSession
);

router.get(
  "/",
  authMiddleware,
  fetchUserInterviews
);

router.post("/coding/generate", authMiddleware, async (req, res) => {
  try {
    const { topic, difficulty, numQuestions } = req.body;
    const challenges = await generateCodingChallenge({ topic, difficulty, numQuestions });
    res.json({ success: true, challenges });
  } catch (err) {
    console.error("Generate coding route error:", err);
    res.status(500).json({ error: "Failed to generate AI coding challenge." });
  }
});

// POST /adaptive/next — Generates next adaptive question based on response depth
router.post("/adaptive/next", authMiddleware, async (req, res) => {
  try {
    const { topic, history, roleRubric } = req.body;
    const result = await generateAdaptiveNextQuestion({ topic, history, roleRubric });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Adaptive next error:", err);
    res.status(500).json({ error: "Failed to generate next adaptive question." });
  }
});

// POST /adaptive/evaluate — Generates SWOT Analysis & Role Rubric Scores
router.post("/adaptive/evaluate", authMiddleware, async (req, res) => {
  try {
    const { topic, qnaPairs, roleRubric } = req.body;
    const swotReport = await generateSwotAnalysis({ topic, qnaPairs, roleRubric });
    res.json({ success: true, swotReport });
  } catch (err) {
    console.error("SWOT evaluation error:", err);
    res.status(500).json({ error: "Failed to generate SWOT analysis report." });
  }
});

// GET /analytics/history — Candidate speech, integrity, and coding trend metrics
router.get("/analytics/history", authMiddleware, async (req, res) => {
  try {
    const analytics = {
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
    };
    res.json({ success: true, analytics });
  } catch (err) {
    console.error("Analytics history error:", err);
    res.status(500).json({ error: "Failed to fetch analytics history." });
  }
});

router.get(
  "/:id",
  authMiddleware,
  getInterviewDetails
);

export default router;