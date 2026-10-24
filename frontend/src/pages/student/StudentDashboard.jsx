import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClubs } from "../../api/clubs";
import { fetchApplications } from "../../api/applications";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [clubData, applicationData] =
          await Promise.all([
            fetchClubs(),
            user?.id
              ? fetchApplications({
                  student_id: user.id,
                })
              : Promise.resolve([]),
          ]);

        setClubs(clubData);
        setApplications(applicationData);

      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);


  if (loading) {
    return <Loader />;
  }


  const pendingApplications =
    applications.filter(
      (application) =>
        application.status === "Applied" ||
        application.status === "Under Review"
    ).length;


  const selectedApplications =
    applications.filter(
      (application) =>
        application.status === "Selected"
    ).length;


  const recentApplications =
    [...applications]
      .sort(
        (a, b) =>
          new Date(b.applied_at) -
          new Date(a.applied_at)
      )
      .slice(0, 5);


  return (
    <div className="page-container">

      {/* Header */}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Student Dashboard
          </h1>

          <p className="text-gray-500">
            Welcome back, {user?.name || "Student"}.
          </p>

        </div>


        <Link
          to="/student/clubs"
          className="btn-primary"
        >
          Explore Clubs
        </Link>

      </div>


      {/* Error */}

      {error && (
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
      )}


      {/* Statistics */}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">

        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {clubs.length}
          </p>

          <span className="text-sm text-gray-500">
            Available Clubs
          </span>

        </div>


        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {applications.length}
          </p>

          <span className="text-sm text-gray-500">
            My Applications
          </span>

        </div>


        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {pendingApplications}
          </p>

          <span className="text-sm text-gray-500">
            Pending Applications
          </span>

        </div>

      </div>


      {/* Recent Applications */}

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-xl font-bold text-gray-800">
          Recent Applications
        </h2>

        <Link
          to="/student/applications"
          className="text-brand-600 text-sm font-semibold"
        >
          View all &rarr;
        </Link>

      </div>


      <div className="flex flex-col gap-3">

        {recentApplications.map(
          (application) => (

            <Link
              key={application.id}
              to="/student/applications"
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >

              <div>

                <span className="text-xs text-gray-500">
                  Position
                </span>

                <h3 className="font-semibold text-gray-800">
                  {application.position}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Applied on{" "}
                  {application.applied_at
                    ? new Date(
                        application.applied_at
                      ).toLocaleDateString()
                    : "—"}
                </p>

              </div>


              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  application.status ===
                  "Selected"
                    ? "bg-green-100 text-green-700"
                    : application.status ===
                      "Rejected"
                    ? "bg-red-100 text-red-700"
                    : application.status ===
                      "Shortlisted"
                    ? "bg-blue-100 text-blue-700"
                    : application.status ===
                      "Under Review"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {application.status}
              </span>

            </Link>

          )
        )}


        {applications.length === 0 && (

          <div className="card">

            <p className="text-gray-500">
              You haven't applied to any
              club positions yet.
            </p>

            <Link
              to="/student/clubs"
              className="text-brand-600 text-sm font-semibold inline-block mt-2"
            >
              Explore clubs &rarr;
            </Link>

          </div>

        )}

      </div>


      {/* Selected Application Message */}

      {selectedApplications > 0 && (

        <div className="card mt-6">

          <h2 className="font-bold text-gray-800">
            Application Update
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            You have {selectedApplications} selected
            application
            {selectedApplications !== 1
              ? "s"
              : ""}.
          </p>

        </div>

      )}

    </div>
  );
}