import { generateInterviewQuestions } from "../services/geminiService.js";
import {
  createClashRoomInDb,
  saveClashQuestions,
  getClashRoomByCode,
  getClashQuestions,
  addOrUpdateParticipant,
  getClashParticipants,
  saveClashAnswer,
  getClashAnswersByRoom,
  saveClashResult,
  getClashResult,
  updateClashRoomStatus,
} from "../repositories/clashRepository.js";
import { evaluateClashMatch } from "../services/clashEvaluationService.js";

// Helper to generate 6-character uppercase room codes (e.g. "CLASH-78A")
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CLASH-${code}`;
}

export const createClashRoom = async (req, res) => {
  try {
    const { role, techStack, difficulty, numQuestions = 3 } = req.body;
    const hostUserId = req.user.uid;

    if (!role || !techStack || !difficulty) {
      return res.status(400).json({ message: "Role, techStack, and difficulty are required" });
    }

    const roomCode = generateRoomCode();
    const room = await createClashRoomInDb({
      roomCode,
      hostUserId,
      role,
      techStack,
      difficulty,
      numQuestions: Number(numQuestions) || 3,
    });

    // Generate shared questions for both candidates
    const rawQuestions = await generateInterviewQuestions({
      role,
      techStack,
      difficulty,
      numQuestions: Number(numQuestions) || 3,
    });

    const savedQuestions = await saveClashQuestions(roomCode, rawQuestions);

    // Host joins as first participant
    await addOrUpdateParticipant({
      roomCode,
      userId: hostUserId,
      userName: req.user.name || req.user.email?.split("@")[0] || "Host Candidate",
      userPicture: req.user.picture || "",
      status: "joined",
    });

    return res.status(201).json({
      message: "Clash room created successfully",
      roomCode,
      room,
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Create Clash Room Error:", error);
    return res.status(500).json({ message: error.message || "Failed to create clash room" });
  }
};

export const getClashRoomDetails = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await getClashRoomByCode(roomCode);

    if (!room) {
      return res.status(404).json({ message: "Clash room not found" });
    }

    const questions = await getClashQuestions(roomCode);
    const participants = await getClashParticipants(roomCode);

    return res.status(200).json({
      room,
      questions,
      participants,
    });
  } catch (error) {
    console.error("Get Clash Room Error:", error);
    return res.status(500).json({ message: "Failed to fetch clash room details" });
  }
};

export const submitClashAnswers = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { answers } = req.body; // Array of { questionId, answerText }
    const userId = req.user.uid;

    const room = await getClashRoomByCode(roomCode);
    if (!room) {
      return res.status(404).json({ message: "Clash room not found" });
    }

    // Save candidate answers
    if (Array.isArray(answers)) {
      for (const a of answers) {
        if (a.questionId && a.answerText !== undefined) {
          await saveClashAnswer({
            roomCode,
            userId,
            questionId: a.questionId,
            answerText: a.answerText,
          });
        }
      }
    }

    const participants = await getClashParticipants(roomCode);
    const questions = await getClashQuestions(roomCode);
    const allAnswers = await getClashAnswersByRoom(roomCode);

    // Evaluate match if all answers are in or room completed
    const clashEval = await evaluateClashMatch({
      roomCode,
      role: room.role,
      techStack: room.tech_stack,
      difficulty: room.difficulty,
      questions,
      participants,
      answers: allAnswers,
    });

    const result = await saveClashResult({
      roomCode,
      winnerUserId: clashEval.winnerUserId,
      evaluationData: clashEval,
    });

    await updateClashRoomStatus(roomCode, "completed");

    return res.status(200).json({
      message: "Clash answers submitted successfully",
      result: clashEval,
    });
  } catch (error) {
    console.error("Submit Clash Answers Error:", error);
    return res.status(500).json({ message: "Failed to submit clash answers" });
  }
};

export const getClashMatchResult = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const resultRow = await getClashResult(roomCode);

    if (!resultRow) {
      return res.status(404).json({ message: "Clash result not found yet" });
    }

    return res.status(200).json({
      roomCode,
      winnerUserId: resultRow.winner_user_id,
      result: resultRow.evaluation_data,
    });
  } catch (error) {
    console.error("Get Clash Result Error:", error);
    return res.status(500).json({ message: "Failed to fetch clash result" });
  }
};
