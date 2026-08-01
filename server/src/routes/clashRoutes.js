import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createClashRoom,
  getClashRoomDetails,
  submitClashAnswers,
  getClashMatchResult,
} from "../controllers/clashController.js";

const router = express.Router();

router.post("/create", authMiddleware, createClashRoom);
router.get("/:roomCode", authMiddleware, getClashRoomDetails);
router.post("/:roomCode/submit", authMiddleware, submitClashAnswers);
router.get("/:roomCode/result", authMiddleware, getClashMatchResult);

export default router;
