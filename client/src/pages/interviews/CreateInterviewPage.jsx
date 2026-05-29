import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

function CreateInterviewPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [role, setRole] = useState("");

  const [techStack, setTechStack] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("Easy");

  const [loading, setLoading] =
    useState(false);

  const handleCreateInterview = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token =
        await user.getIdToken();

      const response = await api.post(
        "/interviews",
        {
          role,
          techStack,
          difficulty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Interview Created:",
        response.data
      );

      navigate(
        `/interviews/${response.data.interview.id}`
      );
    } catch (error) {
      console.error(
        "CREATE INTERVIEW ERROR:"
      );

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          Create Interview
        </h1>

        <form
          onSubmit={handleCreateInterview}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block font-medium">
              Role
            </label>

            <input
              type="text"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              placeholder="Frontend Developer"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Tech Stack
            </label>

            <input
              type="text"
              value={techStack}
              onChange={(e) =>
                setTechStack(
                  e.target.value
                )
              }
              placeholder="React, Node.js"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value
                )
              }
              className="w-full rounded-lg border p-3"
            >
              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white"
          >
            {loading
              ? "Creating..."
              : "Create Interview"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateInterviewPage;