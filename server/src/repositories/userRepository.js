import pool from "../config/db.js";

export const findUserByFirebaseUid = async (
  firebaseUid
) => {
  const query = `
    SELECT * FROM users
    WHERE firebase_uid = $1
  `;

  const result = await pool.query(query, [
    firebaseUid,
  ]);

  return result.rows[0];
};

export const createUser = async ({
  firebaseUid,
  name,
  email,
  profilePicture,
}) => {
  const query = `
    INSERT INTO users (
      firebase_uid,
      name,
      email,
      profile_picture
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    firebaseUid,
    name,
    email,
    profilePicture,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};