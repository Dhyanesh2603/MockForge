import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function ResultPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = await user.getIdToken();

        const response = await api.get(
          `/results/${interviewId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(response.data.result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchResult();
  }, [user, interviewId]);

  const getScoreColor = (score) => {
    if (score >= 75) return "text-green-600 bg-green-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Interview Result</h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        {/* Score */}
        <div className={`mb-8 rounded-xl p-6 ${getScoreColor(result?.overall_score)}`}>
          <h2 className="text-2xl font-bold">Overall Score</h2>
          <p className="mt-3 text-5xl font-bold">
            {result?.overall_score}/100
          </p>
        </div>

        {/* Strengths */}
        <div className="mb-6">
          <h2 className="mb-3 text-2xl font-bold">Strengths</h2>
          <div className="rounded-xl bg-green-100 p-5">
            {result?.strengths}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="mb-6">
          <h2 className="mb-3 text-2xl font-bold">Weaknesses</h2>
          <div className="rounded-xl bg-red-100 p-5">
            {result?.weaknesses}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">Feedback</h2>
          <div className="rounded-xl bg-gray-100 p-5">
            {result?.feedback}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;