import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-5xl font-bold">
        MockForge
      </h1>

      <p className="mb-8 text-gray-600">
        AI Mock Interview Platform
      </p>

      <Link
        to="/login"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Get Started
      </Link>
    </div>
  );
}

export default HomePage;