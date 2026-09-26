import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await login(email, password);

    if (result.success) {
      window.location.href = "/";
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="page-container max-w-md">
      <div className="card">

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome to ClubSphere
        </h1>

        <p className="text-gray-500 mb-6">
          Login to continue.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >

          <div>
            <label className="label">
              Email
            </label>

            <input
              name="email"
              type="email"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">
              Password
            </label>

            <input
              name="password"
              type="password"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}


function AppRoutes() {
  return (
    <>
      <Navbar />

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