import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

function InterviewDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [interview, setInterview] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [submitting, setSubmitting] =
    useState(false);

  const getInitialTime = () => {
    const savedTime = localStorage.getItem(
      `timer-${id}`
    );

    return savedTime
      ? Number(savedTime)
      : 30 * 60;
  };

  const [timeLeft, setTimeLeft] =
    useState(getInitialTime);

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    const fetchInterviewDetails =
      async () => {
        try {
          const token =
            await user.getIdToken();

          const interviewResponse =
            await api.get(
              `/interviews/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setInterview(
            interviewResponse.data
              .interview
          );

          setQuestions(
            interviewResponse.data
              .questions
          );

          const answersResponse =
            await api.get(
              `/answers/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const answersMap = {};

          answersResponse.data.answers.forEach(
            (answer) => {
              answersMap[
                answer.question_id
              ] = answer.answer_text;
            }
          );

          setAnswers(answersMap);
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

  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const updatedTime =
          prev - 1;

        localStorage.setItem(
          `timer-${id}`,
          updatedTime
        );

        if (updatedTime <= 0) {
          clearInterval(timer);

          handleSubmitInterview();

          localStorage.removeItem(
            `timer-${id}`
          );

          return 0;
        }

        return updatedTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, id]);

  const currentQuestion =
    questions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (
      currentQuestionIndex <
      questions.length - 1
    ) {
      setCurrentQuestionIndex(
        currentQuestionIndex + 1
      );
    }
  };

  const handlePreviousQuestion =
    () => {
      if (
        currentQuestionIndex > 0
      ) {
        setCurrentQuestionIndex(
          currentQuestionIndex - 1
        );
      }
    };

  const saveAnswerToBackend =
    async (
      questionId,
      answerText
    ) => {
      try {
        const token =
          await user.getIdToken();

        await api.post(
          "/answers",
          {
            interviewId: id,
            questionId,
            answerText,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error(
          "SAVE ANSWER ERROR:"
        );

        console.error(error);
      }
    };

  const handleAnswerChange =
    async (value) => {
      const updatedAnswers = {
        ...answers,

        [currentQuestion.id]:
          value,
      };

      setAnswers(updatedAnswers);

      await saveAnswerToBackend(
        currentQuestion.id,
        value
      );
    };

  const handleSubmitInterview =
    async () => {
      try {
        setSubmitting(true);

        const token =
          await user.getIdToken();

        await api.post(
          "/results/submit",
          {
            interviewId: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubmitted(true);

        localStorage.removeItem(
          `timer-${id}`
        );

        navigate(
          `/results/${id}`
        );
      } catch (error) {
        console.error(
          "SUBMIT INTERVIEW ERROR:"
        );

        console.error(error);

        alert(
          "Failed to evaluate interview"
        );
      } finally {
        setSubmitting(false);
      }
    };

  const formatTime = (
    seconds
  ) => {
    const mins = Math.floor(
      seconds / 60
    );

    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">
              {interview.role}
            </h1>

            <p className="text-lg text-gray-600">
              {interview.tech_stack}
            </p>

            <p className="text-lg text-gray-600">
              Difficulty:{" "}
              {
                interview.difficulty
              }
            </p>
          </div>

          <div
            className={`rounded-xl px-6 py-4 text-2xl font-bold ${
              timeLeft < 300
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Question{" "}
            {currentQuestionIndex +
              1}{" "}
            of {questions.length}
          </h2>

          <div className="rounded-full bg-blue-100 px-4 py-2 text-blue-700">
            Progress:{" "}
            {Math.round(
              ((currentQuestionIndex +
                1) /
                questions.length) *
                100
            )}
            %
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 p-6">
          <p className="mb-6 text-xl font-medium leading-relaxed">
            {
              currentQuestion?.question_text
            }
          </p>

          <textarea
            rows="8"
            placeholder="Type your answer here..."
            value={
              answers[
                currentQuestion?.id
              ] || ""
            }
            disabled={
              submitted
            }
            onChange={(e) =>
              handleAnswerChange(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={
              handlePreviousQuestion
            }
            disabled={
              currentQuestionIndex ===
              0
            }
            className="rounded-lg bg-gray-300 px-6 py-3 disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={
                handleSubmitInterview
              }
              disabled={
                submitted ||
                submitting
              }
              className="rounded-lg bg-green-600 px-6 py-3 text-white disabled:opacity-50"
            >
              {submitting
                ? "Evaluating..."
                : submitted
                ? "Submitted"
                : "Submit Interview"}
            </button>

            <button
              onClick={
                handleNextQuestion
              }
              disabled={
                currentQuestionIndex ===
                questions.length -
                  1
              }
              className="rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewDetailsPage;