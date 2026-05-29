import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

function DashboardPage() {
  const { user, loading } = useAuth();

  const navigate = useNavigate();

  const [interviews, setInterviews] =
    useState([]);

  const [pageLoading, setPageLoading] =
    useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchInterviews =
      async () => {
        try {
          const token =
            await user.getIdToken();

          const response = await api.get(
            "/interviews",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setInterviews(
            response.data.interviews
          );
        } catch (error) {
          console.error(error);
        } finally {
          setPageLoading(false);
        }
      };

    if (user) {
      fetchInterviews();
    }
  }, [user]);

  if (loading || pageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-black">
              Dashboard
            </h1>

            <p className="mt-2 text-lg text-gray-700">
              Welcome{" "}
              {user?.displayName}
            </p>
          </div>

          <Link
            to="/create-interview"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Create Interview
          </Link>
        </div>

        <h2 className="mb-6 text-3xl font-bold text-black">
          Interview History
        </h2>

        {interviews.length === 0 ? (
          <div className="rounded-xl bg-white p-10 shadow-2xl">
            <p className="text-lg">
              No interviews found
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-2xl border-2 border-black bg-white p-6 shadow-2xl"
              >
                <h3 className="mb-4 text-3xl font-bold text-black">
                  {interview.role}
                </h3>

                <p className="mb-3 text-lg text-gray-700">
                  {interview.tech_stack}
                </p>

                <p className="mb-6 text-lg text-gray-700">
                  Difficulty:{" "}
                  {interview.difficulty}
                </p>

                <Link
                  to={`/interviews/${interview.id}`}
                  className="inline-block rounded-lg bg-black px-5 py-3 text-white"
                >
                  Open Interview
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;