import {
  findUserByFirebaseUid,
  createUser,
} from "../repositories/userRepository.js";

export const loginUser = async (req, res) => {
  try {
    const firebaseUser = req.user;

    let user = await findUserByFirebaseUid(
      firebaseUser.uid
    );

    if (!user) {
      user = await createUser({
        firebaseUid: firebaseUser.uid,

        name: firebaseUser.name,

        email: firebaseUser.email,

        profilePicture: firebaseUser.picture,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("FULL LOGIN ERROR:");
    console.error(error);

    return res.status(500).json({
    message: error.message,
    });
  }
};