import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchClubs,
  createClub,
  deleteClub,
} from "../../api/clubs";

const emptyForm = {
  name: "",
  category: "General",
  description: "",
  logo: "",
  faculty_coordinator: "",
};

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Literary",
  "Social",
  "General",
];

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadClubs = async () => {
    setLoading(true);

    try {
      const data = await fetchClubs();
      setClubs(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load clubs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await createClub({
        name: form.name,
        category: form.category,
        description: form.description,
        logo: form.logo,
        faculty_coordinator:
          form.faculty_coordinator,
        activities: [],
        admin_ids: [],
      });

      setForm(emptyForm);
      setShowForm(false);

      await loadClubs();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create club."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this club permanently?"
    );

    if (!confirmed) return;

    try {
      await deleteClub(id);
      await loadClubs();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete club."
      );
    }
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Clubs
          </h1>

          <p className="text-gray-500 mt-1">
            Create and manage college clubs.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((value) => !value);
            setError("");
          }}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "+ Add Club"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}

      {/* Create Club Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="card grid sm:grid-cols-2 gap-4 mb-8"
        >

          <div>
            <label className="label">
              Club Name
            </label>

            <input
              name="name"
              className="input-field"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter club name"
              required
            />
          </div>

          <div>
            <label className="label">
              Category
            </label>

            <select
              name="category"
              className="input-field"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              Description
            </label>

            <textarea
              name="description"
              className="input-field"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the club..."
              required
            />
          </div>

          <div>
            <label className="label">
              Logo URL
            </label>

            <input
              name="logo"
              className="input-field"
              value={form.logo}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="label">
              Faculty Coordinator
            </label>

            <input
              name="faculty_coordinator"
              className="input-field"
              value={form.faculty_coordinator}
              onChange={handleChange}
              placeholder="Faculty coordinator name"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary sm:col-span-2"
          >
            {submitting
              ? "Creating..."
              : "Create Club"}
          </button>

        </form>
      )}

      {/* Clubs */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            Loading clubs...
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {clubs.map((club) => (
            <div
              key={club.id}
              className="card flex flex-col gap-3"
            >

              <div className="flex items-center justify-between gap-2">

                <h3 className="font-bold text-gray-800">
                  {club.name}
                </h3>

                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                  {club.category}
                </span>

              </div>

              <p className="text-sm text-gray-600 line-clamp-3">
                {club.description}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded-full w-fit ${
                  club.status === "approved"
                    ? "bg-green-50 text-green-700"
                    : club.status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {club.status}
              </span>

              <div className="flex items-center justify-between mt-2">

                <Link
                  to={`/central-admin/clubs/${club.id}`}
                  className="text-brand-600 text-sm font-semibold"
                >
                  Manage →
                </Link>

                <button
                  onClick={() =>
                    handleDelete(club.id)
                  }
                  className="text-red-500 text-sm font-semibold"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

          {clubs.length === 0 && (
            <p className="text-gray-500">
              No clubs found.
            </p>
          )}

        </div>
      )}

    </div>
  );
}