import { createInterview } from "../repositories/interviewRepository.js";

import { generateInterviewQuestions } from "../services/geminiService.js";

export const createInterviewSession =
  async (req, res) => {
    try {
      const { role, techStack, difficulty } =
        req.body;

      const firebaseUser = req.user;

      // Validation
      if (
        !role ||
        !techStack ||
        !difficulty
      ) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      // Create interview in DB
      const interview =
        await createInterview({
          userId: firebaseUser.uid,
          role,
          techStack,
          difficulty,
        });

      // Generate AI questions
      const questions =
        await generateInterviewQuestions({
          role,
          techStack,
          difficulty,
        });

      return res.status(201).json({
        message:
          "Interview session created successfully",

        interview,

        questions,
      });
    } catch (error) {
      console.error(
        "CREATE INTERVIEW ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        message: error.message,
      });
    }
  };