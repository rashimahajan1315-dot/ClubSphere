import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const links = user?.role === "student" ? [
    ["Dashboard", "/student/dashboard"], ["Explore Clubs", "/student/clubs"],
    ["Applications", "/student/applications"], ["Notifications", "/student/notifications"],
  ] : user?.role === "club_admin" ? [
    ["Dashboard", "/club-admin/dashboard"], ["Club Profile", "/club-admin/profile"],
    ["Recruitments", "/club-admin/recruitments"], ["Applications", "/club-admin/applications"],
    ["Notifications", "/club-admin/notifications"],
  ] : user?.role === "central_admin" ? [
    ["Dashboard", "/central-admin/dashboard"], ["Clubs", "/central-admin/clubs"],
    ["Recruitments", "/central-admin/recruitments"], ["Applications", "/central-admin/applications"],
    ["Users", "/central-admin/users"],
  ] : [];

  return (
    <nav className="app-navbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-5">
        <Link to="/" className="brand-lockup" aria-label="ClubSphere home">
          <span className="brand-mark">C</span>
          <span className="brand-copy"><strong>ClubSphere</strong><small>MIT-WPU · CAMPUS COMMUNITY</small></span>
        </Link>
        {isAuthenticated && <div className="nav-links">
          {links.map(([label, path]) => <Link key={path} to={path} className={location.pathname === path || location.pathname.startsWith(path + "/") ? "nav-link active" : "nav-link"}>{label}</Link>)}
        </div>}
        <div className="nav-account">
          {isAuthenticated ? <>
            <span className="nav-user">{user?.name || (user?.role || "User").replace("_", " ")}</span>
            <button onClick={handleLogout} className="btn-secondary nav-logout">Logout</button>
          </> : <Link to="/login" className="btn-primary">Login</Link>}
        </div>
      </div>
    </nav>
  );
}
