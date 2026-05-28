import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AI Mock Interview API Running",
  });
});

app.use("/api/auth", authRoutes);

export default app;