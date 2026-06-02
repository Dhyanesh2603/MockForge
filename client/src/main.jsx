import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";
 
// NOTE: StrictMode removed intentionally — it double-fires useEffect in dev,
// which causes duplicate API calls and exhausts Gemini quota immediately.
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
 