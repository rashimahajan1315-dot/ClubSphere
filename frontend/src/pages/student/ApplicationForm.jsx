import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { fetchRecruitment } from "../../api/recruitments";
import { createApplication } from "../../api/applications";
import { fetchClub } from "../../api/clubs";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recruitment, setRecruitment] = useState(null);
  const [club, setClub] = useState(null);

  const [loading, setLoading] = useState(true);

  const [answer, setAnswer] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        const recruitmentData =
          await fetchRecruitment(id);

        setRecruitment(recruitmentData);

        if (recruitmentData.club_id) {
          try {
            const clubData = await fetchClub(
              recruitmentData.club_id
            );

            setClub(clubData);
          } catch {
            // Club information is optional here.
          }
        }

      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Failed to load recruitment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!user) {
      navigate("/login");
      return;
    }


    if (user.role !== "student") {
      setError(
        "Only student accounts can apply to recruitments."
      );
      return;
    }


    if (
      !recruitment ||
      recruitment.status !== "open"
    ) {
      setError(
        "This recruitment is closed for applications."
      );
      return;
    }


    setSubmitting(true);

    try {

      await createApplication({
        student_id: user.id,
        club_id: recruitment.club_id,
        recruitment_id: id,
        position:
          recruitment.position_title,
        submitted_data: {
          answer: answer,
        },
      });

      setSuccess(true);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to submit application."
      );

    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <Loader />;
  }


  if (!recruitment) {
    return (
      <div className="page-container">
        Recruitment not found.
      </div>
    );
  }


  if (success) {
    return (
      <div className="page-container max-w-lg text-center">

        <div className="card">

          <h2 className="text-xl font-bold text-green-700 mb-2">
            Application submitted!
          </h2>

          <p className="text-gray-600 mb-4">
            You'll be notified as your application
            status changes.
          </p>

          <Link
            to="/student/applications"
            className="btn-primary inline-block"
          >
            View My Applications
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div className="page-container max-w-xl">

      <div className="card mb-6">

        <div className="flex items-start justify-between gap-2">

          <div>

            <span className="text-xs text-gray-500">
              {club?.name ||
                `Club ID: ${recruitment.club_id}`}
            </span>

            <h1 className="text-xl font-bold text-gray-800">
              {recruitment.position_title}
            </h1>

          </div>

          <StatusBadge
            status={recruitment.status}
          />

        </div>


        <p className="text-gray-600 mt-3">
          {recruitment.description}
        </p>

      </div>


      {recruitment.status !== "open" ? (

        <p className="text-red-600 font-medium">
          This recruitment is closed for
          applications.
        </p>

      ) : (

        <form
          onSubmit={handleSubmit}
          className="card flex flex-col gap-4"
        >

          <h2 className="font-bold text-gray-800">
            Apply now
          </h2>


          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}


          <div>

            <label className="label">
              Position
            </label>

            <input
              className="input-field"
              value={
                recruitment.position_title
              }
              readOnly
            />

          </div>


          {recruitment.application_questions
            ?.length > 0 && (

            <div>

              <label className="label">
                Application Questions
              </label>

              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">

                {recruitment.application_questions.map(
                  (question, index) => (

                    <p
                      key={index}
                      className="mb-2 last:mb-0"
                    >
                      {index + 1}. {question}
                    </p>

                  )
                )}

              </div>

            </div>

          )}


          <div>

            <label className="label">
              Why do you want to join? (optional)
            </label>

            <textarea
              className="input-field"
              rows={4}
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              placeholder="Tell us about your relevant experience or motivation..."
            />

          </div>


          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting
              ? "Submitting..."
              : "Submit Application"}
          </button>

        </form>

      )}

    </div>
  );
}