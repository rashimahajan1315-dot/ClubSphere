import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchRecruitments } from "../../api/recruitments";

const normalizeStatus = (status) => String(status || "").toLowerCase();

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getRequirementsCount = (requirements) => {
  if (Array.isArray(requirements)) return requirements.length;
  if (typeof requirements === "string" && requirements.trim()) return 1;
  return 0;
};

const getStatusClasses = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "open") return "bg-green-50 text-green-700";
  if (normalized === "closed") return "bg-gray-100 text-gray-600";
  return "bg-amber-50 text-amber-700";
};

export default function Recruitments() {
  const [recruitments, setRecruitments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecruitments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchRecruitments();
      setRecruitments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load recruitments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruitments();
  }, [loadRecruitments]);

  const counts = useMemo(() => {
    return recruitments.reduce(
      (result, recruitment) => {
        if (normalizeStatus(recruitment.status) === "open") result.open += 1;
        else if (normalizeStatus(recruitment.status) === "closed") result.closed += 1;
        else result.other += 1;
        return result;
      },
      { total: recruitments.length, open: 0, closed: 0, other: 0 }
    );
  }, [recruitments]);

  const filteredRecruitments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recruitments.filter((recruitment) => {
      const matchesStatus =
        !statusFilter || normalizeStatus(recruitment.status) === statusFilter;
      const searchable = [
        recruitment.position_title,
        recruitment.club_id,
        recruitment.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [recruitments, statusFilter, search]);

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recruitment Monitoring</h1>
          <p className="mt-1 text-gray-500">
            Monitor recruitment drives across all college clubs.
          </p>
        </div>
        <button
          type="button"
          onClick={loadRecruitments}
          disabled={loading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Recruitments</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">{counts.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Open</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{counts.open}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Closed</p>
          <p className="mt-2 text-3xl font-bold text-gray-700">{counts.closed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Other Statuses</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{counts.other}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          className="input-field min-w-0 flex-1"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by position or club ID..."
          aria-label="Search recruitments"
        />
        <select
          className="input-field sm:!w-48"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter recruitments by status"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
        >
          <span>{error}</span>
          <button type="button" onClick={loadRecruitments} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="card py-10 text-center" aria-live="polite">
          <p className="text-gray-500">Loading recruitments...</p>
        </div>
      ) : (
        <div className="overflow-x-auto card !p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="p-3">Position</th>
                <th scope="col" className="p-3">Club ID</th>
                <th scope="col" className="p-3">Requirements</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruitments.map((recruitment) => (
                <tr
                  key={recruitment.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {recruitment.position_title || "Untitled position"}
                  </td>
                  <td className="p-3 text-gray-600">{recruitment.club_id || "—"}</td>
                  <td className="p-3">{getRequirementsCount(recruitment.requirements)}</td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(recruitment.status)}`}>
                      {recruitment.status || "Unknown"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{formatDate(recruitment.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecruitments.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-medium text-gray-700">
                {recruitments.length === 0 ? "No recruitments found." : "No matching recruitments."}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {recruitments.length === 0
                  ? "Recruitment drives will appear here when available."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && recruitments.length > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Showing {filteredRecruitments.length} of {recruitments.length} recruitments
        </p>
      )}
    </div>
  );
}
