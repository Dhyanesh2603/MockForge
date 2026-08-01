import { evaluateInterview } from "./evaluationService.js";

export const evaluateClashMatch = async ({
  roomCode,
  role,
  techStack,
  difficulty,
  questions,
  participants,
  answers,
}) => {
  if (participants.length === 0) {
    throw new Error("No participants in clash match");
  }

  const evalPromises = participants.map((p) => {
    const userAnswers = answers.filter((a) => String(a.user_id) === String(p.user_id));
    // Map question_id to match question.id format
    const formattedUserAnswers = userAnswers.map((a) => ({
      question_id: a.question_id,
      answer_text: a.answer_text,
    }));

    return evaluateInterview({
      role,
      techStack,
      difficulty,
      questions,
      answers: formattedUserAnswers,
    }).then((evalRes) => ({
      userId: p.user_id,
      userName: p.user_name,
      userPicture: p.user_picture,
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
    questions,
  };
};
