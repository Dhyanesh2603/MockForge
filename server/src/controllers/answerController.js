import {
  saveAnswer,
  getInterviewAnswers,
} from "../repositories/answerRepository.js";

import { getInterviewById } from "../repositories/interviewRepository.js";

export const saveInterviewAnswer =
  async (req, res) => {
    try {
      const {
        interviewId,
        questionId,
        answerText,
      } = req.body;

      const interview = await getInterviewById(interviewId);

      if (!interview) {
        return res.status(404).json({
          message: "Interview not found",
        });
      }

      if (interview.user_id !== req.user.uid) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      const answer = await saveAnswer({
        interviewId,
        questionId,
        answerText,
      });

      return res.status(200).json({
        message:
          "Answer saved successfully",
        answer,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to save answer",
      });
    }
  };

export const getAnswers = async (
  req,
  res
) => {
  try {
    const { interviewId } = req.params;

    const interview = await getInterviewById(interviewId);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (interview.user_id !== req.user.uid) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const answers =
      await getInterviewAnswers(
        interviewId
      );

    return res.status(200).json({
      answers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch answers",
    });
  }
};