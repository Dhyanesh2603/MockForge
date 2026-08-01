import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

/**
 * Global response interceptor — if the server returns 401 or 403,
 * the user's token is invalid/stale. Force-redirect to homepage.
 * This is the server-verified auth layer that catches cases where
 * Firebase client-side may still consider the user "logged in"
 * but the backend rejects the token.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Only redirect if we're not already on the homepage or login page
      const path = window.location.pathname;
      if (path !== "/" && path !== "/login") {
        if (typeof document !== "undefined" && document.body) {
          document.body.style.display = "none";
        }
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
