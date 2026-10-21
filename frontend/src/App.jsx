import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";

// Student
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import ExploreClubs from "./pages/student/ExploreClubs.jsx";
import StudentClubDetails from "./pages/student/ClubDetails.jsx";
import ApplicationForm from "./pages/student/ApplicationForm.jsx";
import MyApplications from "./pages/student/MyApplications.jsx";
import StudentNotifications from "./pages/student/Notifications.jsx";

// Club Admin
import ClubDashboard from "./pages/club-admin/ClubDashboard.jsx";
import ClubProfile from "./pages/club-admin/ClubProfile.jsx";
import RecruitmentManagement from "./pages/club-admin/RecruitmentManagement.jsx";
import ClubApplications from "./pages/club-admin/Applications.jsx";
import ApplicationDetails from "./pages/club-admin/ApplicationDetails.jsx";
import ClubNotifications from "./pages/club-admin/Notifications.jsx";

// Central Admin
import AdminDashboard from "./pages/central-admin/AdminDashboard.jsx";
import AdminClubs from "./pages/central-admin/Clubs.jsx";
import AdminClubDetails from "./pages/central-admin/ClubDetails.jsx";
import AdminRecruitments from "./pages/central-admin/Recruitments.jsx";
import AdminApplications from "./pages/central-admin/Applications.jsx";
import AdminUsers from "./pages/central-admin/Users.jsx";

import "./App.css";
import React from "react";


function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}


function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (user.role === "club_admin") {
    return <Navigate to="/club-admin/dashboard" replace />;
  }

  if (user.role === "central_admin") {
    return <Navigate to="/central-admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}


function LoginPage() {
  const { login, loading } = useAuth();
  const [error, setError] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email.trim(), password);
    if (result.success) {
      window.location.href = "/";
    } else {
      setError(result.message || "Unable to sign in. Please try again.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="ClubSphere sign in">
        <aside className="login-brand">
          <div className="login-logo-wrap">
            <img className="login-logo" src="/mit-wpu-logo.png" alt="MIT World Peace University" />
          </div>
          <div className="login-wordmark">
            <h2>Clubsphere</h2>
            <p>MITWPU</p>
            <div className="login-rule" />
          </div>
          <div className="cas-emblem" aria-label="CAS ERP emblem">
            <strong>CAS</strong><span>ERP</span>
          </div>
        </aside>
        <section className="login-panel">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Please login to your Account</p>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error" role="alert">{error}</div>}
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true"><svg width="25" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <input id="login-email" className="login-input" name="email" type="email" autoComplete="username" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="12" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><circle cx="12" cy="15" r="1.4" fill="white"/><path d="M12 16v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                <input id="login-password" className="login-input" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="login-actions">
              <button className="login-submit" type="submit" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
              <button className="login-reset" type="button" onClick={()=>{setEmail("");setPassword("");setError("");}}>Reset</button>
            </div>
            <a className="login-forgot" href="#forgot-password" onClick={e=>{e.preventDefault();setError("Please contact your ClubSphere administrator to reset your password.");}}>Forgot Password</a>
          </form>
          <footer className="login-footer">Copyright © 2026 Clubsphere. All rights reserved.</footer>
        </section>
      </section>
    </main>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/login" && <Navbar />}

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<HomeRedirect />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />


        {/* ================= STUDENT ================= */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/clubs"
          element={
            <ProtectedRoute roles={["student"]}>
              <ExploreClubs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/clubs/:id"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentClubDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/apply/:id"
          element={
            <ProtectedRoute roles={["student"]}>
              <ApplicationForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/applications"
          element={
            <ProtectedRoute roles={["student"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentNotifications />
            </ProtectedRoute>
          }
        />


        {/* ================= CLUB ADMIN ================= */}

        <Route
          path="/club-admin/dashboard"
          element={
            <ProtectedRoute roles={["club_admin"]}>
              <ClubDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/club-admin/profile"
          element={
            <ProtectedRoute roles={["club_admin"]}>
              <ClubProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/club-admin/recruitments"
          element={
            <ProtectedRoute roles={["club_admin"]}>
              <RecruitmentManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/club-admin/applications"
          element={
            <ProtectedRoute roles={["club_admin"]}>
              <ClubApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/club-admin/applications/:id"
          element={
            <ProtectedRoute roles={["club_admin"]}>
              <ApplicationDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/club-admin/notifications"
          element={
            <ProtectedRoute roles={["club_admin"]}>
              <ClubNotifications />
            </ProtectedRoute>
          }
        />


        {/* ================= CENTRAL ADMIN ================= */}

        <Route
          path="/central-admin/dashboard"
          element={
            <ProtectedRoute roles={["central_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/central-admin/clubs"
          element={
            <ProtectedRoute roles={["central_admin"]}>
              <AdminClubs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/central-admin/clubs/:id"
          element={
            <ProtectedRoute roles={["central_admin"]}>
              <AdminClubDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/central-admin/recruitments"
          element={
            <ProtectedRoute roles={["central_admin"]}>
              <AdminRecruitments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/central-admin/applications"
          element={
            <ProtectedRoute roles={["central_admin"]}>
              <AdminApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/central-admin/users"
          element={
            <ProtectedRoute roles={["central_admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={<HomeRedirect />}
        />

      </Routes>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;