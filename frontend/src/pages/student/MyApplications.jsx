import { useEffect, useState } from "react";
import { fetchApplications } from "../../api/applications";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Loader from "../../components/Loader.jsx";

const STAGES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
];


export default function MyApplications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadApplications = async () => {

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError("");

        const data = await fetchApplications({
          student_id: user.id,
        });

        setApplications(data);

      } catch (err) {

        setError(
          err.response?.data?.detail ||
          "Failed to load your applications."
        );

      } finally {

        setLoading(false);

      }
    };

    loadApplications();

  }, [user]);


  if (loading) {
    return <Loader />;
  }


  return (
    <div className="page-container">

      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        My Applications
      </h1>

      <p className="text-gray-500 mb-6">
        Track the progress of every recruitment
        you've applied to.
      </p>


      {error && (
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
      )}


      {applications.length === 0 ? (

        <p className="text-gray-500">
          You haven't applied to any recruitments yet.
        </p>

      ) : (

        <div className="flex flex-col gap-4">

          {applications.map((application) => (

            <div
              key={application.id}
              className="card fade-in"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <span className="text-xs text-gray-500">
                    Club ID: {application.club_id}
                  </span>

                  <h3 className="font-bold text-gray-800">
                    Recruitment ID:{" "}
                    {application.recruitment_id}
                  </h3>


                  {application.position && (

                    <span className="text-xs text-gray-500">
                      Position: {application.position}
                    </span>

                  )}

                </div>


                <StatusBadge
                  status={application.status}
                />

              </div>


              {application.status !== "Rejected" ? (

                <div className="flex items-center gap-1 mt-4">

                  {STAGES.map((stage, index) => {

                    const currentStage =
                      STAGES.indexOf(
                        application.status
                      );

                    const reached =
                      currentStage >= index;


                    return (

                      <div
                        key={stage}
                        className="flex items-center flex-1"
                      >

                        <div
                          className={`w-3 h-3 rounded-full ${
                            reached
                              ? "bg-brand-600"
                              : "bg-gray-200"
                          }`}
                        />


                        {index <
                          STAGES.length - 1 && (

                          <div
                            className={`flex-1 h-0.5 ${
                              reached &&
                              currentStage > index
                                ? "bg-brand-600"
                                : "bg-gray-200"
                            }`}
                          />

                        )}

                      </div>

                    );

                  })}

                </div>

              ) : (

                <p className="text-sm text-red-600 mt-3">
                  This application was not selected.
                </p>

              )}


              <span className="text-xs text-gray-400 mt-3 block">

                Applied on{" "}

                {application.applied_at
                  ? new Date(
                      application.applied_at
                    ).toLocaleDateString()
                  : "—"}

              </span>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}