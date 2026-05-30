import express from "express";

import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

import interviewRoutes from "./routes/interviewRoutes.js";

import answerRoutes from "./routes/answerRoutes.js";

import resultRoutes from "./routes/resultRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "AI Mock Interview API Running",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/interviews",
  interviewRoutes
);

app.use("/api/answers", answerRoutes);

app.use("/api/results", resultRoutes);

export default app;