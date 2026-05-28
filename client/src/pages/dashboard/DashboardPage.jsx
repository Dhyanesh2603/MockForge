import { useAuth } from "../../context/AuthContext";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { useEffect } from "react";

function DashboardPage() {
  const { user, loading } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">
            Dashboard
          </h1>

          <img
            src={user?.photoURL}
            alt={user?.displayName}
            className="mx-auto mb-4 h-20 w-20 rounded-full"
          />

          <p className="text-lg">
            Welcome {user?.displayName}
          </p>

          <p className="text-gray-600">
            {user?.email}
          </p>

          <div className="mt-6">
            <Link
              to="/interviews/create"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white"
            >
              Create Interview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;