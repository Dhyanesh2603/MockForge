import pool from "../config/db.js";

// Ensure the evaluation_data column exists (runs once on import)
pool.query(`
  ALTER TABLE interview_results
  ADD COLUMN IF NOT EXISTS evaluation_data JSONB DEFAULT '{}'
`).catch((err) => {
  // Ignore if the column already exists or table doesn't exist yet
  console.warn("evaluation_data column check:", err.message);
});

export const saveInterviewResult =
  async ({
    interviewId,
    overallScore,
    strengths,
    weaknesses,
    feedback,
    evaluationData,
  }) => {
    const evalJson = JSON.stringify(evaluationData || {});

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
            evaluation_data = $5,
            created_at = NOW()
        WHERE interview_id = $6
        RETURNING *
      `;
      const updated = await pool.query(updateQuery, [
        overallScore,
        strengths,
        weaknesses,
        feedback,
        evalJson,
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
        feedback,
        evaluation_data
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      interviewId,
      overallScore,
      strengths,
      weaknesses,
      feedback,
      evalJson,
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