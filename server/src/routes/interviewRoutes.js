import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createInterviewSession,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createInterviewSession
);

export default router;