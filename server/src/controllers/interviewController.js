import { createInterview } from "../repositories/interviewRepository.js";

import { saveInterviewQuestions } from "../repositories/questionRepository.js";

import { generateInterviewQuestions } from "../services/geminiService.js";

export const createInterviewSession =
  async (req, res) => {
    try {
      const { role, techStack, difficulty } =
        req.body;

      const firebaseUser = req.user;

      if (
        !role ||
        !techStack ||
        !difficulty
      ) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      // Create interview
      const interview =
        await createInterview({
          userId: firebaseUser.uid,
          role,
          techStack,
          difficulty,
        });

      // Generate questions
      const questions =
        await generateInterviewQuestions({
          role,
          techStack,
          difficulty,
        });

      // Save questions
      await saveInterviewQuestions(
        interview.id,
        questions
      );

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