import pool from "../config/db.js";

// Initialize Clash Database Tables on module import
export const initClashDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clash_rooms (
        id BIGSERIAL PRIMARY KEY,
        room_code VARCHAR(20) UNIQUE NOT NULL,
        host_user_id VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        tech_stack VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        num_questions INT DEFAULT 3,
        proctored BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed'
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE clash_rooms ADD COLUMN IF NOT EXISTS proctored BOOLEAN DEFAULT true;

      CREATE TABLE IF NOT EXISTS clash_questions (
        id BIGSERIAL PRIMARY KEY,
        room_code VARCHAR(20) REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        order_index INT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clash_participants (
        id BIGSERIAL PRIMARY KEY,
        room_code VARCHAR(20) REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_picture TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'joined', -- 'joined', 'ready', 'submitted'
        current_question_index INT DEFAULT 0,
        score INT DEFAULT 0,
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(room_code, user_id)
      );

      CREATE TABLE IF NOT EXISTS clash_answers (
        id BIGSERIAL PRIMARY KEY,
        room_code VARCHAR(20) REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
        user_id VARCHAR(100) NOT NULL,
        question_id BIGINT NOT NULL,
        answer_text TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(room_code, user_id, question_id)
      );

      CREATE TABLE IF NOT EXISTS clash_results (
        id BIGSERIAL PRIMARY KEY,
        room_code VARCHAR(20) UNIQUE REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
        winner_user_id VARCHAR(100), -- NULL if tie
        evaluation_data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Clash DB tables initialized successfully.");
  } catch (err) {
    console.error("❌ Clash DB initialization error:", err.message);
  }
};

initClashDb();

export const createClashRoomInDb = async ({
  roomCode,
  hostUserId,
  role,
  techStack,
  difficulty,
  numQuestions,
  proctored = true,
}) => {
  const query = `
    INSERT INTO clash_rooms (room_code, host_user_id, role, tech_stack, difficulty, num_questions, proctored)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const res = await pool.query(query, [
    roomCode,
    hostUserId,
    role,
    techStack,
    difficulty,
    numQuestions,
    Boolean(proctored),
  ]);
  return res.rows[0];
};

export const saveClashQuestions = async (roomCode, questions) => {
  const inserted = [];
  for (let i = 0; i < questions.length; i++) {
    const qText = typeof questions[i] === "string" ? questions[i] : questions[i].question_text;
    const res = await pool.query(
      `INSERT INTO clash_questions (room_code, question_text, order_index)
       VALUES ($1, $2, $3) RETURNING *`,
      [roomCode, qText, i + 1]
    );
    inserted.push(res.rows[0]);
  }
  return inserted;
};

export const getClashRoomByCode = async (roomCode) => {
  const res = await pool.query(`SELECT * FROM clash_rooms WHERE room_code = $1`, [roomCode]);
  return res.rows[0] || null;
};

export const getClashQuestions = async (roomCode) => {
  const res = await pool.query(
    `SELECT * FROM clash_questions WHERE room_code = $1 ORDER BY order_index ASC`,
    [roomCode]
  );
  return res.rows;
};

export const addOrUpdateParticipant = async ({
  roomCode,
  userId,
  userName,
  userPicture,
  status = "joined",
}) => {
  const query = `
    INSERT INTO clash_participants (room_code, user_id, user_name, user_picture, status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (room_code, user_id)
    DO UPDATE SET user_name = EXCLUDED.user_name,
                  user_picture = EXCLUDED.user_picture,
                  status = EXCLUDED.status
    RETURNING *
  `;
  const res = await pool.query(query, [
    roomCode,
    userId,
    userName || "Anonymous",
    userPicture || "",
    status,
  ]);
  return res.rows[0];
};

export const getClashParticipants = async (roomCode) => {
  const res = await pool.query(
    `SELECT * FROM clash_participants WHERE room_code = $1 ORDER BY joined_at ASC`,
    [roomCode]
  );
  return res.rows;
};

export const updateParticipantStatus = async (roomCode, userId, status) => {
  const res = await pool.query(
    `UPDATE clash_participants SET status = $1 WHERE room_code = $2 AND user_id = $3 RETURNING *`,
    [status, roomCode, userId]
  );
  return res.rows[0];
};

export const updateParticipantProgress = async (roomCode, userId, questionIndex) => {
  await pool.query(
    `UPDATE clash_participants SET current_question_index = $1 WHERE room_code = $2 AND user_id = $3`,
    [questionIndex, roomCode, userId]
  );
};

export const updateClashRoomStatus = async (roomCode, status) => {
  const res = await pool.query(
    `UPDATE clash_rooms SET status = $1 WHERE room_code = $2 RETURNING *`,
    [status, roomCode]
  );
  return res.rows[0];
};

export const saveClashAnswer = async ({ roomCode, userId, questionId, answerText }) => {
  const query = `
    INSERT INTO clash_answers (room_code, user_id, question_id, answer_text)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (room_code, user_id, question_id)
    DO UPDATE SET answer_text = EXCLUDED.answer_text, submitted_at = NOW()
    RETURNING *
  `;
  const res = await pool.query(query, [roomCode, userId, questionId, answerText]);
  return res.rows[0];
};

export const getClashAnswersByRoom = async (roomCode) => {
  const res = await pool.query(
    `SELECT * FROM clash_answers WHERE room_code = $1`,
    [roomCode]
  );
  return res.rows;
};

export const saveClashResult = async ({ roomCode, winnerUserId, evaluationData }) => {
  const query = `
    INSERT INTO clash_results (room_code, winner_user_id, evaluation_data)
    VALUES ($1, $2, $3)
    ON CONFLICT (room_code)
    DO UPDATE SET winner_user_id = EXCLUDED.winner_user_id,
                  evaluation_data = EXCLUDED.evaluation_data,
                  created_at = NOW()
    RETURNING *
  `;
  const res = await pool.query(query, [
    roomCode,
    winnerUserId,
    JSON.stringify(evaluationData),
  ]);
  return res.rows[0];
};

export const getClashResult = async (roomCode) => {
  const res = await pool.query(`SELECT * FROM clash_results WHERE room_code = $1`, [roomCode]);
  return res.rows[0] || null;
};
