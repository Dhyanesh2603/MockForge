import {
  getInterviewById,
  updateInterviewStatus,
} from "../repositories/interviewRepository.js";

import {
  getQuestionsByInterviewId,
} from "../repositories/interviewDetailsRepository.js";

import {
  getInterviewAnswers,
} from "../repositories/answerRepository.js";

import {
  saveInterviewResult,
  getInterviewResult,
} from "../repositories/resultRepository.js";

import {
  evaluateInterview,
} from "../services/evaluationService.js";

export const submitInterview =
  async (req, res) => {
    try {
      const { interviewId } = req.body;

      const interview =
        await getInterviewById(
          interviewId
        );

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

      const existingResult =
        await getInterviewResult(
          interviewId
        );

      if (existingResult) {
        return res.status(200).json({
          message:
            "Result already exists",
          result: existingResult,
        });
      }

      const questions =
        await getQuestionsByInterviewId(
          interviewId
        );

      const answers =
        await getInterviewAnswers(
          interviewId
        );

      const evaluation =
        await evaluateInterview({
          role: interview.role,
          techStack:
            interview.tech_stack,
          difficulty:
            interview.difficulty,
          questions,
          answers,
        });

      const savedResult =
        await saveInterviewResult({
          interviewId,
          overallScore:
            evaluation.overallScore,
          strengths:
            evaluation.strengths,
          weaknesses:
            evaluation.weaknesses,
          feedback:
            evaluation.feedback,
        });

      await updateInterviewStatus(
        interviewId,
        "completed"
      );

      return res.status(200).json({
        message:
          "Interview evaluated successfully",
        result: savedResult,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to evaluate interview",
      });
    }
  };

export const fetchInterviewResult =
  async (req, res) => {
    try {
      const { interviewId } = req.params;

      const interview =
        await getInterviewById(
          interviewId
        );

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

      const result =
        await getInterviewResult(
          interviewId
        );

      return res.status(200).json({
        result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch result",
      });
    }
  };