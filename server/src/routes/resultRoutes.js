import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  submitInterview,
  fetchInterviewResult,
} from "../controllers/resultController.js";

const router = express.Router();

router.post(
  "/submit",
  authMiddleware,
  submitInterview
);

router.get(
  "/:interviewId",
  authMiddleware,
  fetchInterviewResult
);

export default router;