import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateInterviewPage from "../pages/interviews/CreateInterviewPage";
import InterviewDetailsPage from "../pages/interviews/InterviewDetailsPage";
import ResultPage from "../pages/results/ResultPage";

import ClashLobbyPage from "../pages/clash/ClashLobbyPage";
import ClashWaitingRoomPage from "../pages/clash/ClashWaitingRoomPage";
import ClashMatchPage from "../pages/clash/ClashMatchPage";
import ClashResultPage from "../pages/clash/ClashResultPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-interview" element={<CreateInterviewPage />} />
        <Route path="/interviews/:id" element={<InterviewDetailsPage />} />
        <Route path="/results/:interviewId" element={<ResultPage />} />

        {/* 1v1 Clash Routes */}
        <Route path="/clash" element={<ClashLobbyPage />} />
        <Route path="/clash/room/:roomCode" element={<ClashWaitingRoomPage />} />
        <Route path="/clash/match/:roomCode" element={<ClashMatchPage />} />
        <Route path="/clash/results/:roomCode" element={<ClashResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
