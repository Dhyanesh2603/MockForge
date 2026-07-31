import pool from "../config/db.js";

export const saveInterviewResult =
  async ({
    interviewId,
    overallScore,
    strengths,
    weaknesses,
    feedback,
  }) => {
    const existing = await pool.query(
      "SELECT * FROM interview_results WHERE interview_id = $1",
      [interviewId]
    );

    if (existing.rows.length > 0) {
      const updateQuery = `
        UPDATE interview_results
        SET overall_score = $1,
            strengths = $2,
            weaknesses = $3,
            feedback = $4,
            created_at = NOW()
        WHERE interview_id = $5
        RETURNING *
      `;
      const updated = await pool.query(updateQuery, [
        overallScore,
        strengths,
        weaknesses,
        feedback,
        interviewId,
      ]);
      return updated.rows[0];
    }

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