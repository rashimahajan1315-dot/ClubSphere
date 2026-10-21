
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navLinks = {
  student: [
    { label: "Dashboard", to: "/student/dashboard" },
    { label: "Explore Clubs", to: "/student/clubs" },
    { label: "Applications", to: "/student/applications" },
    { label: "Notifications", to: "/student/notifications" },
  ],
  club_admin: [
    { label: "Dashboard", to: "/club-admin/dashboard" },
    { label: "Club Profile", to: "/club-admin/profile" },
    { label: "Recruitments", to: "/club-admin/recruitments" },
    { label: "Applications", to: "/club-admin/applications" },
    { label: "Notifications", to: "/club-admin/notifications" },
  ],
  central_admin: [
    { label: "Dashboard", to: "/central-admin/dashboard" },
    { label: "Clubs", to: "/central-admin/clubs" },
    { label: "Recruitments", to: "/central-admin/recruitments" },
    { label: "Applications", to: "/central-admin/applications" },
    { label: "Users", to: "/central-admin/users" },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = navLinks[user?.role] || [];

  return (
    <>
      <div className="cs-top-strip">
        <div className="cs-top-inner">
          MIT World Peace University · Pune
          <span>Student Clubs & Campus Life</span>
        </div>
      </div>

      <header className="cs-navbar">
        <div className="cs-navbar-inner">
          <Link to="/" className="cs-brand" aria-label="ClubSphere home">
            <span className="cs-brand-mark">C</span>
            <span className="cs-brand-copy">
              <strong>ClubSphere</strong>
              <small>YOUR CAMPUS. YOUR COMMUNITY.</small>
            </span>
          </Link>

          <nav className="cs-nav-links" aria-label="Main navigation">
            {isAuthenticated ? (
              links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="cs-nav-link"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <Link to="/login" className="cs-nav-link">
                Home
              </Link>
            )}
          </nav>

          <div className="cs-nav-actions">
            {isAuthenticated ? (
              <>
                <span className="cs-user-chip">
                  <span className="cs-user-avatar">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="cs-user-name">
                    {user?.name || "User"}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="cs-logout-btn"
                >
                  Logout <span aria-hidden="true">↗</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="cs-login-btn">
                Sign in <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
