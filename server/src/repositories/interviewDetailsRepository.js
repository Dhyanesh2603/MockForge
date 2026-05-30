import pool from "../config/db.js";

export const getInterviewById = async (
  interviewId
) => {
  const interviewQuery = `
    SELECT *
    FROM interviews
    WHERE id = $1
  `;

  const interviewResult =
    await pool.query(interviewQuery, [
      interviewId,
    ]);

  return interviewResult.rows[0];
};

export const getInterviewQuestions =
  async (interviewId) => {
    const questionsQuery = `
      SELECT *
      FROM interview_questions
      WHERE interview_id = $1
      ORDER BY question_order ASC
    `;

    const questionsResult =
      await pool.query(questionsQuery, [
        interviewId,
      ]);

    return questionsResult.rows;
  };

// ALIAS EXPORT
export const getQuestionsByInterviewId =
  getInterviewQuestions;