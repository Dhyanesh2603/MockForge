import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  saveInterviewAnswer,
  getAnswers,
} from "../controllers/answerController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  saveInterviewAnswer
);

router.get(
  "/:interviewId",
  authMiddleware,
  getAnswers
);

export default router;