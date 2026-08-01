import { evaluateInterview } from "./evaluationService.js";

export const evaluateClashMatch = async ({
  roomCode,
  role,
  techStack,
  difficulty,
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
    const p1 = playerEvaluations[0];
    const p2 = playerEvaluations[1];

    if (p1.evaluation.overallScore > p2.evaluation.overallScore) {
      winnerUserId = p1.userId;
    } else if (p2.evaluation.overallScore > p1.evaluation.overallScore) {
      winnerUserId = p2.userId;
    } else {
      winnerUserId = null; // Tie
    }
  } else if (playerEvaluations.length === 1) {
    winnerUserId = playerEvaluations[0].userId;
  }

  return {
    roomCode,
    winnerUserId,
    players: playerEvaluations,
    questions: normalizedQuestions,
  };
};
