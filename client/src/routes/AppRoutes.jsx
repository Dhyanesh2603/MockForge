import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "../pages/HomePage";

import LoginPage from "../pages/auth/LoginPage";

import DashboardPage from "../pages/dashboard/DashboardPage";

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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;