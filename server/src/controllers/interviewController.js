import { createInterview } from "../repositories/interviewRepository.js";

export const createInterviewSession =
  async (req, res) => {
    try {
      const { role, techStack, difficulty } =
        req.body;

      // Firebase user from auth middleware
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

      const interview =
        await createInterview({
          userId: firebaseUser.uid,
          role,
          techStack,
          difficulty,
        });

      return res.status(201).json({
        message:
          "Interview session created successfully",
        interview,
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