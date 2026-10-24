import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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


export default function ClubDetails() {

  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [recruitments, setRecruitments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {

    const loadData = async () => {

      setLoading(true);
      setError("");

      try {

        const [clubData, recruitmentData] =
          await Promise.all([
            fetchClub(id),
            fetchRecruitments({
              club_id: id,
            }),
          ]);

        setForm(clubData);
        setRecruitments(recruitmentData);

      } catch (err) {

        setError(
          err.response?.data?.detail ||
          "Failed to load club details."
        );

      } finally {

        setLoading(false);

      }
    };

    loadData();

  }, [id]);


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {

      await updateClub(id, {
        name: form.name,
        category: form.category,
        description: form.description,
        logo: form.logo || "",
        faculty_coordinator:
          form.faculty_coordinator || "",
      });

      setMessage(
        "Club updated successfully."
      );

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to update club."
      );

    } finally {

      setSaving(false);

    }
  };


  if (loading) {

    return (
      <div className="page-container text-center py-10">
        <p className="text-gray-500">
          Loading club details...
        </p>
      </div>
    );

  }


  if (!form) {

    return (
      <div className="page-container">
        <p className="text-red-500">
          Club not found.
        </p>
      </div>
    );

  }


  return (
    <div className="page-container max-w-3xl">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manage {form.name}
      </h1>


      {/* Club Details Form */}

      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-4 mb-8"
      >

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
            {message}
          </div>
        )}


        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}


        <div>

          <label className="label">
            Club Name
          </label>

          <input
            name="name"
            className="input-field"
            value={form.name || ""}
            onChange={handleChange}
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
            value={form.category || ""}
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


        <div>

          <label className="label">
            Description
          </label>

          <textarea
            name="description"
            className="input-field"
            rows="4"
            value={form.description || ""}
            onChange={handleChange}
          />

        </div>


        <div>

          <label className="label">
            Logo URL
          </label>

          <input
            name="logo"
            className="input-field"
            value={form.logo || ""}
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
            value={
              form.faculty_coordinator || ""
            }
            onChange={handleChange}
            placeholder="Faculty coordinator name"
          />

        </div>


        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >

          {saving
            ? "Saving..."
            : "Save Changes"}

        </button>

      </form>


      {/* Recruitments */}

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Recruitments
      </h2>


      <div className="flex flex-col gap-3">

        {recruitments.map((recruitment) => (

          <div
            key={recruitment.id}
            className="card flex items-center justify-between gap-4"
          >

            <div>

              <h3 className="font-semibold text-gray-800">
                {recruitment.position_title}
              </h3>

              <p className="text-sm text-gray-500">
                Deadline:{" "}
                {recruitment.deadline
                  ? new Date(
                      recruitment.deadline
                    ).toLocaleDateString()
                  : "Not specified"}
              </p>

            </div>


            <span
              className={`text-xs px-3 py-1 rounded-full ${
                recruitment.status === "open"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {recruitment.status}
            </span>

          </div>

        ))}


        {recruitments.length === 0 && (

          <p className="text-gray-500">
            No recruitments posted by this club yet.
          </p>

        )}

      </div>

    </div>
  );
}