import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

function InterviewDetailsPage() {
  const { id } = useParams();

  const { user } = useAuth();

  const [interview, setInterview] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchInterviewDetails =
      async () => {
        try {
          const token =
            await user.getIdToken();

          const response = await api.get(
            `/interviews/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setInterview(
            response.data.interview
          );

          setQuestions(
            response.data.questions
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    if (user) {
      fetchInterviewDetails();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-3xl font-bold">
          {interview.role}
        </h1>

        <p className="mb-2 text-gray-600">
          Tech Stack:{" "}
          {interview.tech_stack}
        </p>

        <p className="mb-6 text-gray-600">
          Difficulty:{" "}
          {interview.difficulty}
        </p>

        <h2 className="mb-4 text-2xl font-semibold">
          Questions
        </h2>

        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="rounded-lg border p-4"
            >
              <p className="font-medium">
                {question.question_order}.
                {" "}
                {question.question_text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InterviewDetailsPage;