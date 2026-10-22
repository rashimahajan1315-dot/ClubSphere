import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchApplications } from "../../api/applications";

const STATUSES = ["Applied", "Under Review", "Shortlisted", "Selected", "Rejected"];

const STATUS_STYLES = {
  Applied: "bg-slate-100 text-slate-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Shortlisted: "bg-blue-50 text-blue-700",
  Selected: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus = !statusFilter || application.status === statusFilter;
      const searchableText = [
        application.student_id,
        application.club_id,
        application.recruitment_id,
        application.position,
        application.status,
      ]
        .map((value) => displayValue(value).toLowerCase())
        .join(" ");

      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [applications, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return STATUSES.reduce((counts, status) => {
      counts[status] = applications.filter((item) => item.status === status).length;
      return counts;
    }, {});
  }, [applications]);

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-600">CENTRAL ADMINISTRATION</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-800">All Applications</h1>
          <p className="mt-1 text-gray-500">
            Monitor student applications across college clubs and recruitments.
          </p>
        </div>
        <button
          type="button"
          onClick={loadApplications}
          disabled={loading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh applications"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter((current) => (current === status ? "" : status))}
            className={`rounded-xl border p-4 text-left transition hover:shadow-sm ${
              statusFilter === status
                ? "border-brand-500 ring-2 ring-brand-100"
                : "border-gray-200 bg-white"
            }`}
            aria-pressed={statusFilter === status}
          >
            <p className="text-sm text-gray-500">{status}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-800">{statusCounts[status] ?? 0}</p>
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>
          <button type="button" onClick={loadApplications} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Application records</h2>
            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading records…"
                : `Showing ${filteredApplications.length} of ${applications.length} applications`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              className="input-field sm:min-w-64"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search IDs, position, status…"
              aria-label="Search applications"
            />
            <select
              className="input-field sm:!w-auto"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter applications by status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500" role="status">
            Loading applications…
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-medium text-gray-700">
              {applications.length === 0 ? "No applications found" : "No matching applications"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {applications.length === 0
                ? "Applications will appear here when students apply to a recruitment."
                : "Try changing your search or status filter."}
            </p>
            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Club ID</th>
                  <th className="px-4 py-3 font-semibold">Recruitment ID</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((application, index) => (
                  <tr
                    key={application.id ?? `${application.student_id}-${application.recruitment_id}-${index}`}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                      {displayValue(application.student_id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {displayValue(application.club_id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {displayValue(application.recruitment_id)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {displayValue(application.position)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[application.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {displayValue(application.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(application.applied_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
