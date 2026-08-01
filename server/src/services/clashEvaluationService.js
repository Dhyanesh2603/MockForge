import { evaluateInterview } from "./evaluationService.js";
import { evaluateCodeClashPair } from "./aiService.js";

export const evaluateClashMatch = async ({
  roomCode,
  role,
  techStack,
  difficulty,
  matchType = "interview",
  questions = [],
  participants = [],
  answers = [],
}) => {
  if (!participants || participants.length === 0) {
    throw new Error("No participants in clash match");
  }

  // Normalize questions array so every item is guaranteed to have `id` and `question_text`
  const normalizedQuestions = (questions || []).map((q, idx) => {
    if (typeof q === "string") {
      return { id: String(idx + 1), question_text: q };
    }
    return {
      id: String(q.id || q.questionId || idx + 1),
      question_text: q.question_text || q.questionText || q.text || `Question ${idx + 1}`,
    };
  });

  const p1 = participants[0];
  const p2 = participants[1] || participants[0];

  const p1Answers = answers.filter((a) => String(a.user_id || a.userId) === String(p1.user_id || p1.userId));
  const p2Answers = answers.filter((a) => String(a.user_id || a.userId) === String(p2.user_id || p2.userId));

  if (matchType === "coding") {
    // Run AI Code Review & Complexity Analysis
    const codeEval = await evaluateCodeClashPair({
      topic: techStack || role || "Coding Challenge",
      difficulty,
      questions: normalizedQuestions,
      p1: { userId: p1.user_id || p1.userId, name: p1.user_name || p1.userName || "Player 1", answers: p1Answers },
      p2: { userId: p2.user_id || p2.userId, name: p2.user_name || p2.userName || "Player 2", answers: p2Answers },
    });

    const playerEvaluations = [
      {
        userId: p1.user_id || p1.userId,
        userName: p1.user_name || p1.userName || "Player 1",
        userPicture: p1.user_picture || p1.userPicture || "",
        evaluation: {
          overallScore: codeEval.player1?.score ?? 0,
          technicalScore: codeEval.player1?.score ?? 0,
          communicationScore: 85,
          clarityScore: 85,
          timeComplexity: codeEval.player1?.timeComplexity || "O(N)",
          spaceComplexity: codeEval.player1?.spaceComplexity || "O(1)",
          questionScores: codeEval.player1?.questionScores || normalizedQuestions.map(() => 0),
          questionCritiques: codeEval.player1?.questionCritiques || normalizedQuestions.map(() => "No valid code provided."),
        },
      },
      {
        userId: p2.user_id || p2.userId,
        userName: p2.user_name || p2.userName || "Player 2",
        userPicture: p2.user_picture || p2.userPicture || "",
        evaluation: {
          overallScore: codeEval.player2?.score ?? 0,
          technicalScore: codeEval.player2?.score ?? 0,
          communicationScore: 80,
          clarityScore: 80,
          timeComplexity: codeEval.player2?.timeComplexity || "O(N^2)",
          spaceComplexity: codeEval.player2?.spaceComplexity || "O(N)",
          questionScores: codeEval.player2?.questionScores || normalizedQuestions.map(() => 0),
          questionCritiques: codeEval.player2?.questionCritiques || normalizedQuestions.map(() => "No valid code provided."),
        },
      },
    ];

    return {
      roomCode,
      matchType: "coding",
      winnerUserId: codeEval.winnerUserId,
      winnerRationale: codeEval.winnerRationale,
      players: playerEvaluations,
      questions: normalizedQuestions,
    };
  }

  // Standard Voice Interview Match Evaluation
  const evalPromises = participants.map((p) => {
    const userAnswers = answers.filter(
      (a) => String(a.user_id || a.userId) === String(p.user_id || p.userId)
    );

    const formattedUserAnswers = userAnswers.map((a, idx) => {
      let rawQId = String(a.question_id || a.questionId || "");
      let targetQId = rawQId;
      if (rawQId.startsWith("q-")) {
        const qIdx = parseInt(rawQId.replace("q-", ""), 10);
        if (!isNaN(qIdx) && normalizedQuestions[qIdx]) {
          targetQId = normalizedQuestions[qIdx].id;
        }
      }
      if (!targetQId || targetQId === "undefined") {
        targetQId = normalizedQuestions[idx]?.id || String(idx + 1);
      }
      return {
        question_id: targetQId,
        answer_text: a.answer_text || a.answerText || "",
      };
    });

    return evaluateInterview({
      role,
      techStack,
      difficulty,
      questions: normalizedQuestions,
      answers: formattedUserAnswers,
    }).then((evalRes) => ({
      userId: p.user_id || p.userId,
      userName: p.user_name || p.userName || "Candidate",
      userPicture: p.user_picture || p.userPicture || "",
      evaluation: evalRes,
    }));
  });

  const playerEvaluations = await Promise.all(evalPromises);

  // Compare overall scores to determine winner
  let winnerUserId = null;
  if (playerEvaluations.length >= 2) {
    const player1 = playerEvaluations[0];
    const player2 = playerEvaluations[1];

    if (player1.evaluation.overallScore > player2.evaluation.overallScore) {
      winnerUserId = player1.userId;
    } else if (player2.evaluation.overallScore > player1.evaluation.overallScore) {
      winnerUserId = player2.userId;
    } else {
      winnerUserId = null; // Tie
    }
  } else if (playerEvaluations.length === 1) {
    winnerUserId = playerEvaluations[0].userId;
  }

  return {
    roomCode,
    matchType: "interview",
    winnerUserId,
    players: playerEvaluations,
    questions: normalizedQuestions,
  };
};
