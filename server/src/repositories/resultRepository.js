import pool from "../config/db.js";

export const saveInterviewResult =
  async ({
    interviewId,
    overallScore,
    strengths,
    weaknesses,
    feedback,
  }) => {
    const query = `
      INSERT INTO interview_results (
        interview_id,
        overall_score,
        strengths,
        weaknesses,
        feedback
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      interviewId,
      overallScore,
      strengths,
      weaknesses,
      feedback,
    ];

    const result = await pool.query(
      query,
      values
    );

    return result.rows[0];
  };

export const getInterviewResult =
  async (interviewId) => {
    const query = `
      SELECT *
      FROM interview_results
      WHERE interview_id = $1
    `;

    const result = await pool.query(
      query,
      [interviewId]
    );

    return result.rows[0];
  };