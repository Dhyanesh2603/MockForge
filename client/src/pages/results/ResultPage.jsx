import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

function ResultPage() {
  const { interviewId } = useParams();

  const { user } = useAuth();

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchResult =
      async () => {
        try {
          const token =
            await user.getIdToken();

          const response =
            await api.get(
              `/results/${interviewId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setResult(
            response.data.result
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    if (user) {
      fetchResult();
    }
  }, [user, interviewId]);

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
        <h1 className="mb-8 text-4xl font-bold">
          Interview Result
        </h1>

        <div className="mb-8 rounded-xl bg-blue-100 p-6">
          <h2 className="text-2xl font-bold">
            Overall Score
          </h2>

          <p className="mt-3 text-5xl font-bold text-blue-700">
            {result?.overall_score}/100
          </p>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-2xl font-bold">
            Strengths
          </h2>

          <div className="rounded-xl bg-green-100 p-5">
            {result?.strengths}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-2xl font-bold">
            Weaknesses
          </h2>

          <div className="rounded-xl bg-red-100 p-5">
            {result?.weaknesses}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-2xl font-bold">
            Feedback
          </h2>

          <div className="rounded-xl bg-gray-100 p-5">
            {result?.feedback}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;