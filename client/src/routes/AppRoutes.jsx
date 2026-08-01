import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateInterviewPage from "../pages/interviews/CreateInterviewPage";
import InterviewDetailsPage from "../pages/interviews/InterviewDetailsPage";
import ResultPage from "../pages/results/ResultPage";
import ProtectedRoute from "../components/ProtectedRoute";

import ClashLobbyPage from "../pages/clash/ClashLobbyPage";
import ClashWaitingRoomPage from "../pages/clash/ClashWaitingRoomPage";
import ClashMatchPage from "../pages/clash/ClashMatchPage";
import ClashResultPage from "../pages/clash/ClashResultPage";

import CreateCodingRoundPage from "../pages/coding/CreateCodingRoundPage";
import CodingArenaPage from "../pages/coding/CodingArenaPage";

import AdaptiveInterviewPage from "../pages/interviews/AdaptiveInterviewPage";
import AnalyticsDashboardPage from "../pages/dashboard/AnalyticsDashboardPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — redirect to homepage if not authenticated */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create-interview" element={<ProtectedRoute><CreateInterviewPage /></ProtectedRoute>} />
        <Route path="/interviews/:id" element={<ProtectedRoute><InterviewDetailsPage /></ProtectedRoute>} />
        <Route path="/results/:interviewId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />

        {/* Adaptive Practice & Analytics Routes (Protected) */}
        <Route path="/adaptive" element={<ProtectedRoute><AdaptiveInterviewPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />

        {/* 1v1 Clash Routes (Protected) */}
        <Route path="/clash" element={<ProtectedRoute><ClashLobbyPage /></ProtectedRoute>} />
        <Route path="/clash/room/:roomCode" element={<ProtectedRoute><ClashWaitingRoomPage /></ProtectedRoute>} />
        <Route path="/clash/match/:roomCode" element={<ProtectedRoute><ClashMatchPage /></ProtectedRoute>} />
        <Route path="/clash/results/:roomCode" element={<ProtectedRoute><ClashResultPage /></ProtectedRoute>} />
        {/* Dedicated Coding Round Routes (Protected) */}
        <Route path="/coding/new" element={<ProtectedRoute><CreateCodingRoundPage /></ProtectedRoute>} />
        <Route path="/coding/:id" element={<ProtectedRoute><CodingArenaPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

