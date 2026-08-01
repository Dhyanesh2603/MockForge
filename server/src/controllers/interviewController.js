import { createInterview, getUserInterviews } from "../repositories/interviewRepository.js";
import { saveInterviewQuestions } from "../repositories/questionRepository.js";
import { generateInterviewQuestions } from "../services/aiService.js";
import { getInterviewDetails } from "./interviewDetailsController.js";

export const createInterviewSession = async (req, res) => {
  try {
    const {
      role, techStack, difficulty,
      numQuestions = 10,
      experience = "", interviewType = "",
      focusAreas = "", targetCompany = "",
      jobDescription = "", additionalContext = "",
      dynamic = false,
      proctored = true,
    } = req.body;

    if (!role || !techStack || !difficulty)
      return res.status(400).json({ message: "role, techStack and difficulty are required" });

    const interview = await createInterview({
      userId: req.user.uid, role, techStack, difficulty, proctored: Boolean(proctored),
    });

    const questions = await generateInterviewQuestions({
      role, techStack, difficulty,
      numQuestions: Number(numQuestions),
      experience, interviewType, focusAreas,
      targetCompany, jobDescription, additionalContext,
    });

    await saveInterviewQuestions(interview.id, questions);

    return res.status(201).json({ message: "Created", interview, questions });
  } catch (err) {
    console.error("CREATE INTERVIEW ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const fetchUserInterviews = async (req, res) => {
  try {
    const interviews = await getUserInterviews(req.user.uid);
    return res.status(200).json({ interviews });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
