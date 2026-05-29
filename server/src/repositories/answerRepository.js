import pool from "../config/db.js";

export const saveAnswer = async ({
  interviewId,
  questionId,
  answerText,
}) => {
  const existingAnswerQuery = `
    SELECT * FROM interview_answers
    WHERE interview_id = $1
    AND question_id = $2
  `;

  const existingAnswer =
    await pool.query(
      existingAnswerQuery,
      [interviewId, questionId]
    );

  // UPDATE existing answer
  if (existingAnswer.rows.length > 0) {
    const updateQuery = `
      UPDATE interview_answers
      SET answer_text = $1,
          updated_at = NOW()
      WHERE interview_id = $2
      AND question_id = $3
      RETURNING *
    `;

    const updatedAnswer =
      await pool.query(updateQuery, [
        answerText,
        interviewId,
        questionId,
      ]);

    return updatedAnswer.rows[0];
  }

  // INSERT new answer
  const insertQuery = `
    INSERT INTO interview_answers (
      interview_id,
      question_id,
      answer_text
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const insertedAnswer =
    await pool.query(insertQuery, [
      interviewId,
      questionId,
      answerText,
    ]);

  return insertedAnswer.rows[0];
};

export const getInterviewAnswers =
  async (interviewId) => {
    const query = `
      SELECT *
      FROM interview_answers
      WHERE interview_id = $1
    `;

    const result = await pool.query(
      query,
      [interviewId]
    );

    return result.rows;
  };