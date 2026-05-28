import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const firebaseAdminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,

    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
      /\\n/g,
      "\n"
    ),
  }),
};

admin.initializeApp(firebaseAdminConfig);

export default admin;