import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications } from "../../api/applications";
import StatusBadge from "../../components/StatusBadge.jsx";
import Loader from "../../components/Loader.jsx";

const STATUSES = [
  "",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "Rejected",
];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchApplications();

        const filteredApplications =
          statusFilter
            ? data.filter(
                (application) =>
                  application.status === statusFilter
              )
            : data;

        setApplications(filteredApplications);

      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [statusFilter]);


  return (
    <div className="page-container">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <h1 className="text-2xl font-bold text-gray-800">
          Applications
        </h1>

        <select
          className="input-field !w-auto"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status || "All statuses"}
            </option>
          ))}
        </select>

      </div>


      {error && (
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
      )}


      {loading ? (

        <Loader />

      ) : (

        <div className="overflow-x-auto card !p-0">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-left text-gray-500">

              <tr>

                <th className="p-3">
                  Applicant
                </th>

                <th className="p-3">
                  Recruitment
                </th>

                <th className="p-3">
                  Position
                </th>

                <th className="p-3">
                  Status
                </th>

                <th className="p-3">
                  Applied
                </th>

                <th className="p-3"></th>

              </tr>

            </thead>


            <tbody>

              {applications.map((application) => (

                <tr
                  key={application.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >

                  <td className="p-3 font-medium text-gray-800">
                    {application.student_id}
                  </td>


                  <td className="p-3">
                    {application.recruitment_id}
                  </td>


                  <td className="p-3">
                    {application.position || "—"}
                  </td>


                  <td className="p-3">
                    <StatusBadge
                      status={application.status}
                    />
                  </td>


                  <td className="p-3 text-gray-500">

                    {application.applied_at
                      ? new Date(
                          application.applied_at
                        ).toLocaleDateString()
                      : "—"}

                  </td>


                  <td className="p-3">

                    <Link
                      to={`/club-admin/applications/${application.id}`}
                      className="text-brand-600 font-semibold"
                    >
                      Review
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {applications.length === 0 && (

            <p className="text-gray-500 p-4">
              No applications found.
            </p>

          )}

        </div>

      )}

    </div>
  );
}