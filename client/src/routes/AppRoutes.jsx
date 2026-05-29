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
          path="/interviews/:id"
          element={<InterviewDetailsPage />}
        />

        <Route
          path="/interviews/create"
          element={
            <CreateInterviewPage />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;