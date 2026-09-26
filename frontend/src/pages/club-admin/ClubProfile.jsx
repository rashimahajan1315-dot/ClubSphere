import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchClub, updateClub } from "../../api/clubs";
import Loader from "../../components/Loader.jsx";

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Literary",
  "Social",
  "General",
];

export default function ClubProfile() {
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    if (!user?.club_id) {
      setLoading(false);
      return;
    }

    fetchClub(user.club_id)
      .then((data) => {
        setClub(data);
        setForm(data);
      })
      .catch(() => {
        setMessage("Failed to load club profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);


  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };


  const handleActivitiesChange = (value) => {
    setForm((current) => ({
      ...current,
      activities: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const updated = await updateClub(
        club.id,
        {
          name: form.name,
          category: form.category,
          description: form.description,
          logo: form.logo,
          activities: form.activities,
          faculty_coordinator:
            form.faculty_coordinator,
        }
      );

      setClub(updated);
      setForm(updated);

      setMessage(
        "Club profile updated successfully."
      );

    } catch (err) {

      setMessage(
        err.response?.data?.detail ||
        "Failed to update club."
      );

    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <Loader />;
  }


  if (!user?.club_id) {
    return (
      <div className="page-container">
        <p className="text-gray-600">
          Your account isn't linked to a club yet.
          Ask the central admin to assign you one.
        </p>
      </div>
    );
  }


  if (!form) {
    return (
      <div className="page-container">
        <p className="text-gray-600">
          Club profile could not be loaded.
        </p>
      </div>
    );
  }


  return (
    <div className="page-container max-w-xl">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Club Profile
      </h1>


      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-4"
      >

        {message && (
          <p className="text-sm text-brand-700">
            {message}
          </p>
        )}


        <div>

          <label className="label">
            Club Name
          </label>

          <input
            className="input-field"
            value={form.name || ""}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
            required
          />

        </div>


        <div>

          <label className="label">
            Category
          </label>

          <select
            className="input-field"
            value={form.category || ""}
            onChange={(e) =>
              handleChange(
                "category",
                e.target.value
              )
            }
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
            className="input-field"
            rows={4}
            value={form.description || ""}
            onChange={(e) =>
              handleChange(
                "description",
                e.target.value
              )
            }
          />

        </div>


        <div>

          <label className="label">
            Logo URL
          </label>

          <input
            className="input-field"
            value={form.logo || ""}
            onChange={(e) =>
              handleChange(
                "logo",
                e.target.value
              )
            }
            placeholder="https://..."
          />

        </div>


        <div>

          <label className="label">
            Faculty Coordinator
          </label>

          <input
            className="input-field"
            value={
              form.faculty_coordinator || ""
            }
            onChange={(e) =>
              handleChange(
                "faculty_coordinator",
                e.target.value
              )
            }
            placeholder="Faculty coordinator name"
          />

        </div>


        <div>

          <label className="label">
            Activities
          </label>

          <input
            className="input-field"
            value={
              (form.activities || []).join(", ")
            }
            onChange={(e) =>
              handleActivitiesChange(
                e.target.value
              )
            }
            placeholder="Workshops, Events, Competitions"
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

    </div>
  );
}