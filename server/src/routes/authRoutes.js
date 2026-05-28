import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import { loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/login",
  authMiddleware,
  loginUser
);

export default router;