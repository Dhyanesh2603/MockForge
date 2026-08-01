import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createInterviewSession,
  fetchUserInterviews,
} from "../controllers/interviewController.js";

import {
  getInterviewDetails,
} from "../controllers/interviewDetailsController.js";

import { generateCodingChallenge } from "../services/geminiService.js";

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

router.get(
  "/:id",
  authMiddleware,
  getInterviewDetails
);

export default router;