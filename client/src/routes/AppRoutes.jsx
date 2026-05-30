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

import ResultPage from "../pages/results/ResultPage";

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

        <Route
          path="/results/:interviewId"
          element={<ResultPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;