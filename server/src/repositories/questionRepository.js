import pool from "../config/db.js";

export const saveInterviewQuestions =
  async (interviewId, questions) => {
    let order = 1;

    for (const question of questions) {
      const query = `
        INSERT INTO interview_questions (
          interview_id,
          question_text,
          question_order
        )
        VALUES ($1, $2, $3)
      `;

      const values = [
        interviewId,
        question,
        order,
      ];

      await pool.query(query, values);

      order++;
    }
  };