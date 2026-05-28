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
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome {user?.displayName}</p>
      </div>
    </div>
  );
}

export default DashboardPage;