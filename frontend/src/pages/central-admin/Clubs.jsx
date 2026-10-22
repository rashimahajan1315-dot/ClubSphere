import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClubs, createClub, deleteClub } from "../../api/clubs";

const emptyForm = {
  name: "",
  category: "General",
  description: "",
  logo: "",
  faculty_coordinator: "",
};

const CATEGORIES = ["Technical", "Cultural", "Sports", "Literary", "Social", "General"];
const STATUSES = ["all", "pending", "approved", "rejected"];

function statusClasses(status) {
  switch (String(status || "pending").toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
}

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string") return data;
  return fallback;
}

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadClubs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchClubs();
      // Support APIs that return either a list directly or a paginated response.
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setClubs(list);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load clubs. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const counts = useMemo(() => {
    const total = clubs.length;
    const approved = clubs.filter((club) => String(club.status || "").toLowerCase() === "approved").length;
    const rejected = clubs.filter((club) => String(club.status || "").toLowerCase() === "rejected").length;
    return { total, approved, rejected, pending: total - approved - rejected };
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clubs.filter((club) => {
      const matchesSearch = !query || [club.name, club.description, club.faculty_coordinator, club.category]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const matchesCategory = categoryFilter === "all" || String(club.category || "General").toLowerCase() === categoryFilter;
      const normalizedStatus = String(club.status || "pending").toLowerCase();
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [clubs, search, categoryFilter, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createClub({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        logo: form.logo.trim(),
        faculty_coordinator: form.faculty_coordinator.trim(),
        activities: [],
        admin_ids: [],
      });

      setForm(emptyForm);
      setShowForm(false);
      setSuccess("Club created successfully.");
      await loadClubs();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create club. Please check the details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (club) => {
    const confirmed = window.confirm(`Delete “${club.name}” permanently? This action cannot be undone.`);
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(club.id);
    try {
      await deleteClub(club.id);
      setClubs((current) => current.filter((item) => item.id !== club.id));
      setSuccess(`${club.name} was deleted.`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete this club. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-container space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Central administration</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage Clubs</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
            Keep track of college clubs, review their status, and manage club records from one place.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={loadClubs}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setSuccess("");
            }}
            className="btn-primary rounded-xl px-4 py-2.5"
          >
            {showForm ? "Cancel" : "+ Add Club"}
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadClubs} className="shrink-0 font-semibold underline underline-offset-2">Try again</button>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss success message" className="text-lg leading-none">×</button>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total clubs", value: counts.total, color: "text-gray-900", mark: "◎" },
          { label: "Approved", value: counts.approved, color: "text-emerald-700", mark: "✓" },
          { label: "Pending review", value: counts.pending, color: "text-amber-700", mark: "◷" },
          { label: "Rejected", value: counts.rejected, color: "text-rose-700", mark: "×" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">{item.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-base ${item.color}`} aria-hidden="true">{item.mark}</span>
            </div>
            <p className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </section>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Create a club</h2>
            <p className="mt-1 text-sm text-gray-500">Enter the basic details to add a club to the directory.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="club-name" className="label">Club name <span className="text-rose-500">*</span></label>
              <input id="club-name" name="name" className="input-field" value={form.name} onChange={handleChange} placeholder="e.g. Coding Club" maxLength={100} required />
            </div>
            <div>
              <label htmlFor="club-category" className="label">Category</label>
              <select id="club-category" name="category" className="input-field" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="club-description" className="label">Description <span className="text-rose-500">*</span></label>
              <textarea id="club-description" name="description" className="input-field min-h-28" rows={4} value={form.description} onChange={handleChange} placeholder="What does this club do?" maxLength={1000} required />
              <p className="mt-1 text-right text-xs text-gray-400">{form.description.length}/1000</p>
            </div>
            <div>
              <label htmlFor="club-logo" className="label">Logo URL</label>
              <input id="club-logo" name="logo" type="url" className="input-field" value={form.logo} onChange={handleChange} placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <label htmlFor="club-coordinator" className="label">Faculty coordinator</label>
              <input id="club-coordinator" name="faculty_coordinator" className="input-field" value={form.faculty_coordinator} onChange={handleChange} placeholder="Coordinator's name" maxLength={100} />
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary rounded-xl px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Creating club…" : "Create club"}
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Club directory</h2>
            <p className="mt-1 text-sm text-gray-500">{loading ? "Loading club records…" : `${filteredClubs.length} of ${clubs.length} clubs shown`}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[580px]">
            <div className="relative sm:col-span-3 lg:col-span-1">
              <label htmlFor="club-search" className="sr-only">Search clubs</label>
              <input id="club-search" className="input-field w-full pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clubs…" />
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
            </div>
            <div>
              <label htmlFor="category-filter" className="sr-only">Filter by category</label>
              <select id="category-filter" className="input-field w-full" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {CATEGORIES.map((category) => <option key={category} value={category.toLowerCase()}>{category}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status-filter" className="sr-only">Filter by status</label>
              <select id="status-filter" className="input-field w-full capitalize" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {STATUSES.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 w-2/3 rounded bg-gray-100" /><div className="mt-4 h-3 w-full rounded bg-gray-100" /><div className="mt-2 h-3 w-4/5 rounded bg-gray-100" /><div className="mt-6 h-7 w-24 rounded-full bg-gray-100" /></div>)}
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl text-gray-400" aria-hidden="true">◎</div>
            <h3 className="mt-4 text-base font-semibold text-gray-800">{clubs.length === 0 ? "No clubs yet" : "No matching clubs"}</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">{clubs.length === 0 ? "Create the first club to start building your college club directory." : "Try changing your search or filters to find a club."}</p>
            {clubs.length === 0 ? (
              <button type="button" onClick={() => setShowForm(true)} className="btn-primary mt-4 rounded-xl px-4 py-2">+ Add your first club</button>
            ) : (
              <button type="button" onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); }} className="mt-4 text-sm font-semibold text-brand-700 hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredClubs.map((club) => (
              <article key={club.id} className="group flex min-w-0 flex-col rounded-xl border border-gray-200 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-5">
                <div className="flex items-start gap-3">
                  {club.logo ? (
                    <img src={club.logo} alt={`${club.name || "Club"} logo`} loading="lazy" className="h-12 w-12 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700" aria-hidden="true">{String(club.name || "C").trim().charAt(0).toUpperCase()}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold text-gray-900">{club.name || "Unnamed club"}</h3>
                    <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{club.category || "General"}</span>
                  </div>
                </div>

                <p className="mt-4 min-h-[3.75rem] break-words text-sm leading-6 text-gray-600 line-clamp-3">{club.description || "No description has been added yet."}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(club.status)}`}>
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    {String(club.status || "pending").replaceAll("_", " ")}
                  </span>
                  {club.faculty_coordinator && <span className="max-w-[50%] truncate text-xs text-gray-500" title={club.faculty_coordinator}>Faculty: {club.faculty_coordinator}</span>}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <Link to={`/central-admin/clubs/${club.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800">
                    Manage club <span aria-hidden="true">→</span>
                  </Link>
                  <button type="button" onClick={() => handleDelete(club)} disabled={deletingId === club.id} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                    {deletingId === club.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
