import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchApplication,
  updateApplication,
} from "../../api/applications";
import StatusBadge from "../../components/StatusBadge.jsx";
import Loader from "../../components/Loader.jsx";

const STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "Rejected",
];

export default function ApplicationDetails() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");


  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchApplication(id);
      setApplication(data);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to load application."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, [id]);


  const handleStatusChange = async (status) => {
    setUpdating(true);
    setError("");

    try {
      const updated = await updateApplication(
        id,
        { status }
      );

      setApplication(updated);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to update application status."
      );
    } finally {
      setUpdating(false);
    }
  };


  if (loading) {
    return <Loader />;
  }


  if (!application) {
    return (
      <div className="page-container">
        {error || "Application not found."}
      </div>
    );
  }


  return (
    <div className="page-container max-w-2xl">

      <Link
        to="/club-admin/applications"
        className="text-brand-600 text-sm font-semibold"
      >
        &larr; Back to applications
      </Link>


      {error && (
        <p className="text-red-600 text-sm mt-4">
          {error}
        </p>
      )}


      <div className="card mt-4 flex flex-col gap-4">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-xl font-bold text-gray-800">
              Student ID: {application.student_id}
            </h1>

            <span className="text-sm text-gray-500">
              Recruitment ID:{" "}
              {application.recruitment_id}
            </span>

          </div>

          <StatusBadge
            status={application.status}
          />

        </div>


        <div className="grid sm:grid-cols-2 gap-4 text-sm">

          <div>
            <span className="text-gray-500 block">
              Recruitment
            </span>

            <span className="font-medium text-gray-800">
              {application.recruitment_id}
            </span>
          </div>


          <div>
            <span className="text-gray-500 block">
              Position
            </span>

            <span className="font-medium text-gray-800">
              {application.position || "—"}
            </span>
          </div>


          <div>
            <span className="text-gray-500 block">
              Applied on
            </span>

            <span className="font-medium text-gray-800">
              {application.applied_at
                ? new Date(
                    application.applied_at
                  ).toLocaleString()
                : "—"}
            </span>
          </div>


          <div>
            <span className="text-gray-500 block">
              Last updated
            </span>

            <span className="font-medium text-gray-800">
              {application.updated_at
                ? new Date(
                    application.updated_at
                  ).toLocaleString()
                : "—"}
            </span>
          </div>

        </div>


        {application.submitted_data &&
          Object.keys(
            application.submitted_data
          ).length > 0 && (

            <div>

              <span className="text-gray-500 block text-sm mb-1">
                Applicant's Responses
              </span>

              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">

                {Object.entries(
                  application.submitted_data
                ).map(([key, value]) => (

                  <div
                    key={key}
                    className="mb-2 last:mb-0"
                  >

                    <span className="font-semibold">
                      {key}:
                    </span>{" "}

                    {String(value)}

                  </div>

                ))}

              </div>

            </div>

          )}


        <div>

          <span className="label">
            Update Status
          </span>

          <div className="flex flex-wrap gap-2">

            {STATUSES.map((status) => (

              <button
                key={status}
                disabled={
                  updating ||
                  application.status === status
                }
                onClick={() =>
                  handleStatusChange(status)
                }
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  application.status === status
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-brand-400"
                }`}
              >
                {status}
              </button>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}