import pool from "../config/db.js";

export const createInterview = async ({
  userId,
  role,
  techStack,
  difficulty,
}) => {
  const query = `
    INSERT INTO interviews (
      user_id,
      role,
      tech_stack,
      difficulty
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    userId,
    role,
    techStack,
    difficulty,
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
      SELECT *
      FROM interviews
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(
      query,
      [userId]
    );

    return result.rows;
  };