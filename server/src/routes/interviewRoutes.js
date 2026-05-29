import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createInterviewSession,
} from "../controllers/interviewController.js";

import {
  getInterviewDetails,
} from "../controllers/interviewDetailsController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createInterviewSession
);

router.get(
  "/:id",
  authMiddleware,
  getInterviewDetails
);

export default router;