import pool from "../config/db.js";

// Ensure proctored column exists in interviews table
pool.query(`
  ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS proctored BOOLEAN DEFAULT true
`).catch((err) => {
  console.warn("proctored column check:", err.message);
});

export const createInterview =
  async ({
    userId,
    role,
    techStack,
    difficulty,
    proctored = true,
  }) => {
    const query = `
      INSERT INTO interviews (
        user_id,
        role,
        tech_stack,
        difficulty,
        proctored
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      userId,
      role,
      techStack,
      difficulty,
      proctored,
    ];

    const result = await pool.query(
      query,
      values
    );

    return result.rows[0];
  };

export const getUserInterviews =
  async (userId) => {
    const query = `
      SELECT
        interviews.*,
        interview_results.overall_score
      FROM interviews
      LEFT JOIN interview_results
      ON interviews.id = interview_results.interview_id
      WHERE interviews.user_id = $1
      ORDER BY interviews.created_at DESC
    `;

    const result = await pool.query(
      query,
      [userId]
    );

    return result.rows;
  };

export const getInterviewById =
  async (interviewId) => {
    const query = `
      SELECT *
      FROM interviews
      WHERE id = $1
    `;

    const result = await pool.query(
      query,
      [interviewId]
    );

    return result.rows[0];
  };

export const updateInterviewStatus =
  async (interviewId, status) => {
    const query = `
      UPDATE interviews
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(
      query,
      [status, interviewId]
    );

    return result.rows[0];
  };