import { useAuth } from "../../context/AuthContext";

import { useNavigate } from "react-router-dom";

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
    <div className="flex h-screen items-center justify-center">
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
      </div>
    </div>
  );
}

export default DashboardPage;