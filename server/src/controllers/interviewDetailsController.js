import {
  getInterviewById,
  getInterviewQuestions,
} from "../repositories/interviewDetailsRepository.js";

export const getInterviewDetails =
  async (req, res) => {
    try {
      const { id } = req.params;

      const interview =
        await getInterviewById(id);

      if (!interview) {
        return res.status(404).json({
          message: "Interview not found",
        });
      }

      const questions =
        await getInterviewQuestions(id);

      return res.status(200).json({
        interview,
        questions,
      });
    } catch (error) {
      console.error(
        "GET INTERVIEW DETAILS ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        message: error.message,
      });
    }
  };