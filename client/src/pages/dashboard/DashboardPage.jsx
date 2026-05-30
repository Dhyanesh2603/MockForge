import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = await user.getIdToken();

        const response = await api.get("/interviews", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInterviews(response.data.interviews);
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    if (user) fetchInterviews();
  }, [user]);

  const total = interviews.length;
  const completed = interviews.filter(i => i.status === "completed").length;
  const inProgress = total - completed;

  const scoredInterviews = interviews.filter(
  i => i.status === "completed" && typeof i.overall_score === "number"
);

const avgScore =
  scoredInterviews.length > 0
    ? Math.round(
        scoredInterviews.reduce(
          (acc, i) => acc + i.overall_score,
          0
        ) / scoredInterviews.length
      )
    : 0;

  if (loading || pageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">
              Welcome {user?.displayName}
            </p>
          </div>

          <Link
            to="/create-interview"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Create Interview
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">Total</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>

          <div className="rounded-xl bg-green-100 p-5">
            <p className="text-gray-600">Completed</p>
            <p className="text-2xl font-bold">{completed}</p>
          </div>

          <div className="rounded-xl bg-yellow-100 p-5">
            <p className="text-gray-600">In Progress</p>
            <p className="text-2xl font-bold">{inProgress}</p>
          </div>

          <div className="rounded-xl bg-blue-100 p-5">
            <p className="text-gray-600">Avg Score</p>
            <p className="text-2xl font-bold">{avgScore}/100</p>
          </div>
        </div>

        {/* Interviews */}
        <h2 className="mb-6 text-3xl font-bold">Interview History</h2>

        {interviews.length === 0 ? (
          <div className="rounded-xl bg-white p-10">
            No interviews found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-2xl bg-white p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{interview.role}</h3>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      interview.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {interview.status}
                  </span>
                </div>

                <p className="mb-2 text-gray-700">
                  <strong>Tech:</strong> {interview.tech_stack}
                </p>

                <p className="mb-2 text-gray-700">
                  <strong>Difficulty:</strong> {interview.difficulty}
                </p>

                <p className="mb-4 text-gray-700">
                  <strong>Created:</strong>{" "}
                  {new Date(interview.created_at).toLocaleDateString()}
                </p>

                {interview.status === "completed" && (
                  <div className="mb-4 rounded-lg bg-blue-50 p-3">
                    <p className="text-lg font-bold text-blue-700">
                      Score: {interview.overall_score}/100
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {interview.status === "completed" ? (
                    <Link
                      to={`/results/${interview.id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white"
                    >
                      View Result
                    </Link>
                  ) : (
                    <Link
                      to={`/interviews/${interview.id}`}
                      className="rounded-lg bg-black px-4 py-2 text-white"
                    >
                      Continue
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;