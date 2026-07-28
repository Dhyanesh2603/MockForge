import { signInWithPopup } from "firebase/auth";

import {
  auth,
  googleProvider,
} from "../../services/firebase";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Firebase Login
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const user = result.user;

      // Firebase token
      const token = await user.getIdToken();

      // Backend login request
      await api.post(
        "/auth/login",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={handleGoogleLogin}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default LoginPage;