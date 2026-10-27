
import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import Loader from "../../components/Loader.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/users/admin/stats/");
      setStats(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Could not load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-800">
          Central Admin Dashboard
        </h1>

        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={loadStats}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: "Users",
      values: [
        ["Total Users", stats?.users?.total],
        ["Students", stats?.users?.students],
        ["Club Admins", stats?.users?.club_admins],
        ["Central Admins", stats?.users?.central_admins],
      ],
    },
    {
      title: "Clubs",
      values: [
        ["Total Clubs", stats?.clubs?.total],
        ["Approved", stats?.clubs?.approved],
        ["Pending", stats?.clubs?.pending],
        ["Rejected", stats?.clubs?.rejected],
      ],
    },
    {
      title: "Recruitments",
      values: [
        ["Total Recruitments", stats?.recruitments?.total],
        ["Open", stats?.recruitments?.open],
        ["Closed", stats?.recruitments?.closed],
      ],
    },
    {
      title: "Applications",
      values: [
        ["Total Applications", stats?.applications?.total],
        ["Applied", stats?.applications?.applied],
        ["Under Review", stats?.applications?.under_review],
        ["Shortlisted", stats?.applications?.shortlisted],
        ["Selected", stats?.applications?.selected],
        ["Rejected", stats?.applications?.rejected],
      ],
    },
  ];

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-sm text-brand-600">CENTRAL ADMIN</p>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Overview of users, clubs, recruitments and applications.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {section.title}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {section.values.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-800">
                    {typeof value === "number" ? value : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
