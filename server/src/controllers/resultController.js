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

// Helper to build the full result object from DB row + evaluation_data
function buildFullResult(dbResult, answers) {
  const evalData = dbResult.evaluation_data || {};
  return {
    ...dbResult,
    overallScore: dbResult.overall_score || 0,
    technicalScore: evalData.technicalScore || 0,
    communicationScore: evalData.communicationScore || 0,
    clarityScore: evalData.clarityScore || 0,
    questionScores: evalData.questionScores || [],
    questionCritiques: evalData.questionCritiques || [],
    skillGaps: evalData.skillGaps || [],
    strongTopics: evalData.strongTopics || [],
    proctoringData: evalData.proctoringData || { integrityScore: 100, incidents: [] },
    answers: answers || [],
  };
}

export const submitInterview =
  async (req, res) => {
    try {
      const { interviewId, proctoringData } = req.body;

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

      const questions =
        await getQuestionsByInterviewId(
          interviewId
        );

      const answers =
        await getInterviewAnswers(
          interviewId
        );

      // Check for existing valid result (skip re-evaluation unless forced)
      const existingResult =
        await getInterviewResult(
          interviewId
        );

      if (existingResult && existingResult.evaluation_data?.questionScores?.length > 0 && req.query.reEvaluate !== "true") {
        return res.status(200).json({
          message: "Result already exists",
          result: buildFullResult(existingResult, answers),
        });
      }

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

      // Store the full evaluation data blob
      const evaluationData = {
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        clarityScore: evaluation.clarityScore,
        questionScores: evaluation.questionScores,
        questionCritiques: evaluation.questionCritiques,
        skillGaps: evaluation.skillGaps,
        strongTopics: evaluation.strongTopics,
        proctoringData: proctoringData || { integrityScore: 100, incidents: [] },
      };

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
          evaluationData,
        });

      await updateInterviewStatus(
        interviewId,
        "completed"
      );

      return res.status(200).json({
        message:
          "Interview evaluated successfully",
        result: buildFullResult(savedResult, answers),
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

      if (!result) {
        return res.status(404).json({
          message: "Result not found",
        });
      }

      const answers =
        await getInterviewAnswers(
          interviewId
        );

      return res.status(200).json({
        result: buildFullResult(result, answers),
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch result",
      });
    }
  };