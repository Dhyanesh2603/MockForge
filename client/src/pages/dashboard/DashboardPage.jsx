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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-600">
              Welcome{" "}
              {user?.displayName}
            </p>
          </div>

          <Link
            to="/create-interview"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Create Interview
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="rounded-lg bg-white p-6 shadow"
            >
              <h2 className="mb-2 text-2xl font-semibold">
                {interview.role}
              </h2>

              <p className="mb-2 text-gray-600">
                {interview.tech_stack}
              </p>

              <p className="mb-4 text-gray-600">
                Difficulty:{" "}
                {interview.difficulty}
              </p>

              <Link
                to={`/interviews/${interview.id}`}
                className="inline-block rounded-lg bg-black px-4 py-2 text-white"
              >
                Open Interview
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;