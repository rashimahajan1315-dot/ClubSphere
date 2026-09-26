import { useEffect, useState } from "react";
import {
  fetchRecruitments,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
} from "../../api/recruitments";
import Loader from "../../components/Loader.jsx";

const emptyForm = {
  position_title: "",
  description: "",
  requirements: "",
  application_questions: "",
  start_date: "",
  deadline: "",
};


export default function RecruitmentManagement() {
  const [recruitments, setRecruitments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const load = async () => {
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
    load();
  }, []);


  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };


  const convertToArray = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await createRecruitment({
        position_title: form.position_title,
        description: form.description,

        requirements:
          convertToArray(form.requirements),

        application_questions:
          convertToArray(
            form.application_questions
          ),

        start_date: form.start_date
          ? new Date(
              form.start_date
            ).toISOString()
          : new Date().toISOString(),

        deadline: form.deadline
          ? new Date(
              form.deadline
            ).toISOString()
          : null,
      });

      setForm(emptyForm);
      setShowForm(false);

      await load();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to create recruitment."
      );
    } finally {
      setSubmitting(false);
    }
  };


  const toggleStatus = async (recruitment) => {
    try {
      await updateRecruitment(
        recruitment.id,
        {
          status:
            recruitment.status === "open"
              ? "closed"
              : "open",
        }
      );

      await load();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to update recruitment status."
      );
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this recruitment permanently?"
    );

    if (!confirmed) return;

    try {
      await deleteRecruitment(id);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to delete recruitment."
      );
    }
  };


  return (
    <div className="page-container">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <h1 className="text-2xl font-bold text-gray-800">
          Manage Recruitments
        </h1>

        <button
          onClick={() =>
            setShowForm((value) => !value)
          }
          className="btn-primary"
        >
          {showForm
            ? "Cancel"
            : "+ New Recruitment"}
        </button>

      </div>


      {error && (
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
      )}


      {showForm && (

        <form
          onSubmit={handleSubmit}
          className="card flex flex-col gap-4 mb-8 fade-in"
        >

          <div>

            <label className="label">
              Position Title
            </label>

            <input
              className="input-field"
              value={form.position_title}
              onChange={(e) =>
                handleChange(
                  "position_title",
                  e.target.value
                )
              }
              placeholder="e.g. Technical Lead"
              required
            />

          </div>


          <div>

            <label className="label">
              Description
            </label>

            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe this position..."
            />

          </div>


          <div>

            <label className="label">
              Requirements
            </label>

            <input
              className="input-field"
              value={form.requirements}
              onChange={(e) =>
                handleChange(
                  "requirements",
                  e.target.value
                )
              }
              placeholder="React, Python, Git"
            />

            <p className="text-xs text-gray-500 mt-1">
              Separate requirements with commas.
            </p>

          </div>


          <div>

            <label className="label">
              Application Questions
            </label>

            <input
              className="input-field"
              value={
                form.application_questions
              }
              onChange={(e) =>
                handleChange(
                  "application_questions",
                  e.target.value
                )
              }
              placeholder="Why do you want to join?, Describe your experience"
            />

            <p className="text-xs text-gray-500 mt-1">
              Separate questions with commas.
            </p>

          </div>


          <div>

            <label className="label">
              Start Date
            </label>

            <input
              type="datetime-local"
              className="input-field"
              value={form.start_date}
              onChange={(e) =>
                handleChange(
                  "start_date",
                  e.target.value
                )
              }
              required
            />

          </div>


          <div>

            <label className="label">
              Application Deadline
            </label>

            <input
              type="datetime-local"
              className="input-field"
              value={form.deadline}
              onChange={(e) =>
                handleChange(
                  "deadline",
                  e.target.value
                )
              }
              required
            />

          </div>


          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting
              ? "Creating..."
              : "Create Recruitment"}
          </button>

        </form>

      )}


      {loading ? (

        <Loader />

      ) : (

        <div className="flex flex-col gap-3">

          {recruitments.map((recruitment) => (

            <div
              key={recruitment.id}
              className="card flex items-center justify-between flex-wrap gap-3"
            >

              <div>

                <h3 className="font-bold text-gray-800">
                  {recruitment.position_title}
                </h3>

                <span className="text-xs text-gray-500">

                  {recruitment.requirements?.length || 0}
                  {" "}requirement(s)

                  {" · "}

                  deadline{" "}

                  {recruitment.deadline
                    ? new Date(
                        recruitment.deadline
                      ).toLocaleDateString()
                    : "—"}

                </span>

              </div>


              <div className="flex items-center gap-3">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    recruitment.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {recruitment.status}
                </span>


                <button
                  onClick={() =>
                    toggleStatus(recruitment)
                  }
                  className="btn-secondary !py-1.5 !px-3 text-sm"
                >
                  {recruitment.status === "open"
                    ? "Close"
                    : "Reopen"}
                </button>


                <button
                  onClick={() =>
                    handleDelete(recruitment.id)
                  }
                  className="text-red-500 text-sm font-semibold"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}


          {recruitments.length === 0 && (

            <p className="text-gray-500">
              No recruitments created yet.
            </p>

          )}

        </div>

      )}

    </div>
  );
}