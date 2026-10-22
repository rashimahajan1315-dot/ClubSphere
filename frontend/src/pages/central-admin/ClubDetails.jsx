import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchClub, updateClub } from "../../api/clubs";
import { fetchRecruitments } from "../../api/recruitments";

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Literary",
  "Social",
  "General",
];

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (data && typeof data === "object") {
    const firstValue = Object.values(data).flat()[0];
    if (typeof firstValue === "string") return firstValue;
  }
  return fallback;
};

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not specified"
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "open" || value === "approved") {
    return "bg-green-50 text-green-700";
  }
  if (value === "rejected" || value === "closed") {
    return "bg-red-50 text-red-700";
  }
  return "bg-amber-50 text-amber-700";
};

export default function ClubDetails() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recruitmentError, setRecruitmentError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setRecruitmentError("");

    try {
      const [clubResult, recruitmentResult] = await Promise.allSettled([
        fetchClub(id),
        fetchRecruitments({ club_id: id }),
      ]);

      if (clubResult.status === "rejected") {
        throw clubResult.reason;
      }

      setForm(clubResult.value);
      if (recruitmentResult.status === "fulfilled") {
        setRecruitments(Array.isArray(recruitmentResult.value) ? recruitmentResult.value : []);
      } else {
        setRecruitments([]);
        setRecruitmentError(
          getErrorMessage(recruitmentResult.reason, "Could not load this club's recruitments.")
        );
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load club details."));
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description || "",
        logo: form.logo?.trim() || "",
        faculty_coordinator: form.faculty_coordinator?.trim() || "",
      };
      await updateClub(id, payload);
      setForm((current) => ({ ...current, ...payload }));
      setMessage("Club details saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update club. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" aria-hidden="true" />
          <p className="text-gray-700">Loading club details...</p>
          <p className="mt-1 text-sm text-gray-500">This should only take a moment.</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="page-container">
        <Link to="/central-admin/clubs" className="mb-4 inline-flex text-sm font-medium text-brand-700 hover:underline">
          ← Back to clubs
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
          <h1 className="text-lg font-semibold text-red-800">Unable to load club</h1>
          <p className="mt-1 text-sm text-red-700">{error || "This club may have been deleted or you may not have permission to view it."}</p>
          <button type="button" onClick={loadData} className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const clubInitial = String(form.name || "C").trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="page-container space-y-7">
      <div>
        <Link to="/central-admin/clubs" className="mb-4 inline-flex text-sm font-medium text-brand-700 hover:underline">
          ← Back to clubs
        </Link>
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          {form.logo ? (
            <img
              src={form.logo}
              alt={`${form.name} logo`}
              className="h-16 w-16 rounded-2xl border border-gray-100 bg-gray-50 object-cover"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-semibold text-brand-700" aria-hidden="true">
              {clubInitial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{form.name}</h1>
              {form.category && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{form.category}</span>}
              {form.status && <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass(form.status)}`}>{String(form.status).replaceAll("_", " ")}</span>}
            </div>
            <p className="mt-1 text-sm text-gray-500">Update club information and review its recruitment drives.</p>
          </div>
          <button type="button" onClick={loadData} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
          {message}
        </div>
      )}

      <section className="card">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Club information</h2>
          <p className="mt-1 text-sm text-gray-500">Keep the club's public details accurate and up to date.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="club-name" className="label">Club name</label>
            <input id="club-name" name="name" className="input-field" value={form.name || ""} onChange={handleChange} maxLength={120} required />
          </div>
          <div>
            <label htmlFor="club-category" className="label">Category</label>
            <select id="club-category" name="category" className="input-field" value={form.category || "General"} onChange={handleChange}>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="club-description" className="label">Description</label>
            <textarea id="club-description" name="description" className="input-field" rows={4} value={form.description || ""} onChange={handleChange} placeholder="Describe the club, its purpose and activities..." />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="club-logo" className="label">Logo URL</label>
            <input id="club-logo" name="logo" type="url" className="input-field" value={form.logo || ""} onChange={handleChange} placeholder="https://example.com/logo.png" />
            <p className="mt-1 text-xs text-gray-500">Use a publicly accessible image URL, if available.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="club-coordinator" className="label">Faculty coordinator</label>
            <input id="club-coordinator" name="faculty_coordinator" className="input-field" value={form.faculty_coordinator || ""} onChange={handleChange} placeholder="Faculty coordinator name" />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving changes..." : "Save changes"}
            </button>
            <button type="button" disabled={saving} onClick={() => { setForm((current) => ({ ...current, name: current.name || "", category: current.category || "General", description: current.description || "", logo: current.logo || "", faculty_coordinator: current.faculty_coordinator || "" })); setMessage(""); setError(""); }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
              Clear messages
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recruitment drives</h2>
            <p className="mt-1 text-sm text-gray-500">Recruitments associated with this club.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{recruitments.length} {recruitments.length === 1 ? "drive" : "drives"}</span>
        </div>

        {recruitmentError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
            {recruitmentError}
          </div>
        )}

        {recruitments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recruitments.map((recruitment) => (
              <article key={recruitment.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-gray-900">{recruitment.position_title || "Untitled position"}</h3>
                    <p className="mt-1 text-sm text-gray-500">Deadline: {formatDate(recruitment.deadline)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass(recruitment.status)}`}>
                    {String(recruitment.status || "unknown").replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Requirements:</span>{" "}
                  {Array.isArray(recruitment.requirements)
                    ? `${recruitment.requirements.length} listed`
                    : recruitment.requirements
                      ? "Available"
                      : "Not specified"}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm" aria-hidden="true">↗</div>
            <h3 className="font-medium text-gray-800">No recruitments found</h3>
            <p className="mt-1 text-sm text-gray-500">Recruitment drives for this club will appear here when available.</p>
            {recruitmentError && <button type="button" onClick={loadData} className="mt-4 text-sm font-medium text-brand-700 hover:underline">Try loading again</button>}
          </div>
        )}
      </section>
    </div>
  );
}
