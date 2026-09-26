import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="text-2xl font-extrabold text-brand-700"
        >
          ClubSphere
        </Link>

        <div className="flex items-center gap-5">

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="btn-primary"
            >
              Login
            </Link>
          ) : (
            <>
              {user?.role === "student" && (
                <>
                  <Link
                    to="/student/dashboard"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/student/clubs"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Explore Clubs
                  </Link>

                  <Link
                    to="/student/applications"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Applications
                  </Link>

                  <Link
                    to="/student/notifications"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Notifications
                  </Link>
                </>
              )}

              {user?.role === "club_admin" && (
                <>
                  <Link
                    to="/club-admin/dashboard"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/club-admin/profile"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Club Profile
                  </Link>

                  <Link
                    to="/club-admin/recruitments"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Recruitments
                  </Link>

                  <Link
                    to="/club-admin/applications"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Applications
                  </Link>

                  <Link
                    to="/club-admin/notifications"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Notifications
                  </Link>
                </>
              )}

              {user?.role === "central_admin" && (
                <>
                  <Link
                    to="/central-admin/dashboard"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/central-admin/clubs"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Clubs
                  </Link>

                  <Link
                    to="/central-admin/recruitments"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Recruitments
                  </Link>

                  <Link
                    to="/central-admin/applications"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Applications
                  </Link>

                  <Link
                    to="/central-admin/users"
                    className="text-gray-600 hover:text-brand-600 font-medium"
                  >
                    Users
                  </Link>
                </>
              )}

              <span className="text-sm text-gray-500">
                {user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}