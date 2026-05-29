import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "../pages/HomePage";

import LoginPage from "../pages/auth/LoginPage";

import DashboardPage from "../pages/dashboard/DashboardPage";

import CreateInterviewPage from "../pages/interviews/CreateInterviewPage";

import InterviewDetailsPage from "../pages/interviews/InterviewDetailsPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/create-interview"
          element={<CreateInterviewPage />}
        />

        <Route
          path="/interviews/:id"
          element={
            <InterviewDetailsPage />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;