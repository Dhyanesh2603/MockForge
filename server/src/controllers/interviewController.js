import {
  createInterview,
  getUserInterviews,
} from "../repositories/interviewRepository.js";

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

      const interview =
        await createInterview({
          userId: firebaseUser.uid,
          role,
          techStack,
          difficulty,
        });

      const questions =
        await generateInterviewQuestions({
          role,
          techStack,
          difficulty,
        });

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

export const fetchUserInterviews =
  async (req, res) => {
    try {
      const firebaseUser = req.user;

      const interviews =
        await getUserInterviews(
          firebaseUser.uid
        );

      return res.status(200).json({
        interviews,
      });
    } catch (error) {
      console.error(
        "FETCH INTERVIEWS ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        message: error.message,
      });
    }
  };