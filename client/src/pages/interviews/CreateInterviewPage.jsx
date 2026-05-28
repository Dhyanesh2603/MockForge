import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { auth } from "../../services/firebase";

import api from "../../services/api";

function CreateInterviewPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");

  const [techStack, setTechStack] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("medium");

  const [loading, setLoading] =
    useState(false);

  const handleCreateInterview = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Current Firebase user
      const currentUser =
        auth.currentUser;

      // Firebase token
      const token =
        await currentUser.getIdToken();

      // API request
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

      alert(
        "Interview created successfully"
      );

      navigate("/dashboard");
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          Create Interview
        </h1>

        <form
          onSubmit={handleCreateInterview}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block font-medium">
              Role
            </label>

            <input
              type="text"
              placeholder="Frontend Developer"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Tech Stack
            </label>

            <input
              type="text"
              placeholder="React, Node.js, PostgreSQL"
              value={techStack}
              onChange={(e) =>
                setTechStack(
                  e.target.value
                )
              }
              className="w-full rounded-lg border p-3"
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
              <option value="easy">
                Easy
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="hard">
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