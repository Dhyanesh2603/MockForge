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
            <h1 className="text-5xl font-bold">
              Dashboard
            </h1>

            <p className="mt-2 text-lg text-gray-700">
              Welcome {user?.displayName}
            </p>
          </div>

          <Link
            to="/create-interview"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            Create Interview
          </Link>
        </div>

        <h2 className="mb-6 text-3xl font-bold">
          Interview History
        </h2>

        {interviews.length === 0 ? (
          <div className="rounded-xl bg-white p-10">
            No interviews found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map(
              (interview) => (
                <div
                  key={interview.id}
                  className="rounded-2xl bg-white p-6 shadow-lg"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {interview.role}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        interview.status ===
                        "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {interview.status}
                    </span>
                  </div>

                  <p className="mb-2 text-gray-700">
                    {
                      interview.tech_stack
                    }
                  </p>

                  <p className="mb-2 text-gray-700">
                    Difficulty:{" "}
                    {
                      interview.difficulty
                    }
                  </p>

                  <p className="mb-2 text-gray-700">
                    Created:
                    {" "}
                    {new Date(
                      interview.created_at
                    ).toLocaleDateString()}
                  </p>

                  {interview.overall_score !==
                    null && (
                    <p className="mb-4 text-lg font-bold text-blue-600">
                      Score:{" "}
                      {
                        interview.overall_score
                      }
                      /100
                    </p>
                  )}

                  <Link
                    to={`/interviews/${interview.id}`}
                    className="inline-block rounded-lg bg-black px-5 py-3 text-white"
                  >
                    Open Interview
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;