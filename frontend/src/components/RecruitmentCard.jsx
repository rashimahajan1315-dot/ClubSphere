import { Link } from "react-router-dom";

export default function RecruitmentCard({ recruitment }) {
  const isOpen = recruitment.status === "open";

  return (
    <div className="card flex flex-col gap-3">

      <div className="flex items-start justify-between gap-3">

        <div>
          <span className="text-xs text-gray-500">
            Recruitment Position
          </span>

          <h3 className="text-lg font-bold text-gray-800">
            {recruitment.position_title}
          </h3>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isOpen
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>

      </div>


      <p className="text-sm text-gray-600">
        {recruitment.description ||
          "No description provided."}
      </p>


      {recruitment.requirements?.length > 0 && (

        <div>

          <span className="text-xs font-semibold text-gray-500">
            Requirements
          </span>

          <div className="flex flex-wrap gap-1 mt-1">

            {recruitment.requirements.map(
              (requirement, index) => (

                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {requirement}
                </span>

              )
            )}

          </div>

        </div>

      )}


      <div className="text-xs text-gray-500">

        Deadline:{" "}

        {recruitment.deadline
          ? new Date(
              recruitment.deadline
            ).toLocaleDateString()
          : "Not specified"}

      </div>


      {isOpen ? (

        <Link
          to={`/student/apply/${recruitment.id}`}
          className="btn-primary text-center mt-1"
        >
          Apply Now
        </Link>

      ) : (

        <button
          disabled
          className="btn-secondary mt-1 opacity-60 cursor-not-allowed"
        >
          Applications Closed
        </button>

      )}

    </div>
  );
}