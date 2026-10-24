import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecruitments } from "../../api/recruitments";
import { fetchApplications } from "../../api/applications";


export default function ClubDashboard() {
  const [recruitments, setRecruitments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [recruitmentData, applicationData] =
          await Promise.all([
            fetchRecruitments(),
            fetchApplications(),
          ]);

        setRecruitments(recruitmentData);
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
  }, []);


  if (loading) {
    return (
      <div className="page-container">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }


  const activeCount = recruitments.filter(
    (recruitment) => recruitment.status === "open"
  ).length;


  const pendingCount = applications.filter(
    (application) =>
      application.status === "Applied" ||
      application.status === "Under Review"
  ).length;


  const recentApplications = [...applications]
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
            Club Admin Dashboard
          </h1>

          <p className="text-gray-500">
            Manage your club's recruitments and applications.
          </p>
        </div>


        <Link
          to="/club-admin/recruitments"
          className="btn-primary"
        >
          + New Recruitment
        </Link>

      </div>


      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-6">
          {error}
        </div>
      )}


      {/* Statistics */}

      <div className="grid sm:grid-cols-4 gap-4 mb-8">

        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {recruitments.length}
          </p>

          <span className="text-sm text-gray-500">
            Total Recruitments
          </span>

        </div>


        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {activeCount}
          </p>

          <span className="text-sm text-gray-500">
            Active Recruitments
          </span>

        </div>


        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {applications.length}
          </p>

          <span className="text-sm text-gray-500">
            Total Applications
          </span>

        </div>


        <div className="card text-center">

          <p className="text-3xl font-extrabold text-brand-700">
            {pendingCount}
          </p>

          <span className="text-sm text-gray-500">
            Pending Review
          </span>

        </div>

      </div>


      {/* Recent Applications */}

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-xl font-bold text-gray-800">
          Recent Applications
        </h2>

        <Link
          to="/club-admin/applications"
          className="text-brand-600 text-sm font-semibold"
        >
          View all →
        </Link>

      </div>


      <div className="flex flex-col gap-3">

        {recentApplications.map((application) => (

          <Link
            key={application.id}
            to={`/club-admin/applications/${application.id}`}
            className="card flex items-center justify-between hover:shadow-md transition-shadow"
          >

            <div>

              <span className="text-xs text-gray-500">
                Position: {application.position}
              </span>

              <h3 className="font-semibold text-gray-800">
                Student ID: {application.student_id}
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Applied:{" "}
                {application.applied_at
                  ? new Date(
                      application.applied_at
                    ).toLocaleDateString()
                  : "—"}
              </p>

            </div>


            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                application.status === "Selected"
                  ? "bg-green-100 text-green-700"
                  : application.status === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : application.status === "Shortlisted"
                  ? "bg-blue-100 text-blue-700"
                  : application.status === "Under Review"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {application.status}
            </span>

          </Link>

        ))}


        {applications.length === 0 && (

          <div className="card">

            <p className="text-gray-500">
              No applications received yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}