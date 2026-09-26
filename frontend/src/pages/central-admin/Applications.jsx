import { useEffect, useState } from "react";
import { fetchApplications } from "../../api/applications";


const STATUSES = [
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


  const loadApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApplications();

      setApplications(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadApplications();
  }, []);


  const filteredApplications =
    statusFilter === ""
      ? applications
      : applications.filter(
          (application) =>
            application.status === statusFilter
        );


  return (
    <div className="page-container">

      {/* Header */}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            All Applications
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor all student club applications.
          </p>
        </div>


        <select
          className="input-field !w-auto"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >

          <option value="">
            All statuses
          </option>

          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}

        </select>

      </div>


      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}


      {/* Applications */}

      {loading ? (

        <div className="text-center py-10">
          <p className="text-gray-500">
            Loading applications...
          </p>
        </div>

      ) : (

        <div className="overflow-x-auto card !p-0">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-left text-gray-500">

              <tr>

                <th className="p-3">
                  Student ID
                </th>

                <th className="p-3">
                  Club ID
                </th>

                <th className="p-3">
                  Recruitment ID
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

              </tr>

            </thead>


            <tbody>

              {filteredApplications.map(
                (application) => (

                  <tr
                    key={application.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >

                    <td className="p-3 font-medium text-gray-800">
                      {application.student_id}
                    </td>


                    <td className="p-3">
                      {application.club_id}
                    </td>


                    <td className="p-3">
                      {application.recruitment_id}
                    </td>


                    <td className="p-3 font-medium">
                      {application.position}
                    </td>


                    <td className="p-3">

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          application.status === "Selected"
                            ? "bg-green-50 text-green-700"
                            : application.status === "Rejected"
                            ? "bg-red-50 text-red-700"
                            : application.status === "Shortlisted"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {application.status}
                      </span>

                    </td>


                    <td className="p-3 text-gray-500">

                      {application.applied_at
                        ? new Date(
                            application.applied_at
                          ).toLocaleDateString()
                        : "Not available"}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {filteredApplications.length === 0 && (

            <p className="text-gray-500 p-4">
              No applications found.
            </p>

          )}

        </div>

      )}

    </div>
  );
}