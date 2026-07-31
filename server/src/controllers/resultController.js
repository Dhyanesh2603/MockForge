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
          message: "Access denied. You do not own this interview.",
        });
      }

      const existingResult =
        await getInterviewResult(
          interviewId
        );

      if (existingResult && existingResult.overall_score !== 78 && req.query.reEvaluate !== "true") {
        return res.status(200).json({
          message:
            "Result already exists",
          result: {
            ...existingResult,
            overallScore: existingResult.overall_score,
            technicalScore: Math.min(
              Math.round(existingResult.overall_score * 0.95 + 3),
              100
            ),
            communicationScore: Math.min(
              Math.round(existingResult.overall_score * 0.9 + 4),
              100
            ),
            clarityScore: Math.min(
              Math.round(existingResult.overall_score * 1.02 + 1),
              100
            ),
          },
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

      const fullResult = {
        ...savedResult,
        overallScore: savedResult.overall_score || evaluation.overallScore,
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        clarityScore: evaluation.clarityScore,
      };

      return res.status(200).json({
        message:
          "Interview evaluated successfully",
        result: fullResult,
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
          message: "Access denied. You do not own this interview.",
        });
      }

      const result =
        await getInterviewResult(
          interviewId
        );

      const s = result?.overall_score || 75;
      const fullResult = result
        ? {
            ...result,
            overallScore: s,
            technicalScore: Math.min(
              Math.round(s * 0.95 + 3),
              100
            ),
            communicationScore: Math.min(
              Math.round(s * 0.9 + 4),
              100
            ),
            clarityScore: Math.min(
              Math.round(s * 1.02 + 1),
              100
            ),
          }
        : null;

      return res.status(200).json({
        result: fullResult,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch result",
      });
    }
  };