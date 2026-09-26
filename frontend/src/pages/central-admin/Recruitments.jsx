import { useEffect, useState } from "react";
import { fetchRecruitments } from "../../api/recruitments";


export default function Recruitments() {
  const [recruitments, setRecruitments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadRecruitments = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchRecruitments();

      setRecruitments(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to load recruitments."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadRecruitments();
  }, []);


  const filteredRecruitments =
    statusFilter === ""
      ? recruitments
      : recruitments.filter(
          (recruitment) =>
            recruitment.status === statusFilter
        );


  return (
    <div className="page-container">

      {/* Header */}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            All Recruitments
          </h1>

          <p className="text-gray-500 mt-1">
            View all club recruitment drives.
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

          <option value="open">
            Open
          </option>

          <option value="closed">
            Closed
          </option>
        </select>

      </div>


      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}


      {/* Loading */}

      {loading ? (

        <div className="text-center py-10">
          <p className="text-gray-500">
            Loading recruitments...
          </p>
        </div>

      ) : (

        <div className="overflow-x-auto card !p-0">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-left text-gray-500">

              <tr>

                <th className="p-3">
                  Position
                </th>

                <th className="p-3">
                  Club ID
                </th>

                <th className="p-3">
                  Requirements
                </th>

                <th className="p-3">
                  Status
                </th>

                <th className="p-3">
                  Deadline
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredRecruitments.map(
                (recruitment) => (

                  <tr
                    key={recruitment.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >

                    <td className="p-3 font-medium text-gray-800">
                      {recruitment.position_title}
                    </td>


                    <td className="p-3 text-gray-600">
                      {recruitment.club_id}
                    </td>


                    <td className="p-3">
                      {recruitment.requirements?.length || 0}
                    </td>


                    <td className="p-3">

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          recruitment.status === "open"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {recruitment.status}
                      </span>

                    </td>


                    <td className="p-3 text-gray-500">

                      {recruitment.deadline
                        ? new Date(
                            recruitment.deadline
                          ).toLocaleDateString()
                        : "Not specified"}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {filteredRecruitments.length === 0 && (

            <p className="text-gray-500 p-4">
              No recruitments found.
            </p>

          )}

        </div>

      )}

    </div>
  );
}