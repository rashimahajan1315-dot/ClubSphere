import { Link } from "react-router-dom";

export default function ClubCard({ club }) {
  return (
    <div className="card flex flex-col gap-3">

      <div className="flex items-start gap-3">

        <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">

          {club.logo ? (
            <img
              src={club.logo}
              alt={club.name}
              className="w-full h-full object-cover"
            />
          ) : (
            club.name?.charAt(0)
          )}

        </div>


        <div className="min-w-0">

          <span className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
            {club.category}
          </span>

          <h3 className="font-bold text-gray-800 truncate">
            {club.name}
          </h3>

        </div>

      </div>


      <p className="text-sm text-gray-600 line-clamp-2">
        {club.description ||
          "No description provided."}
      </p>


      {club.activities?.length > 0 && (
        <div className="flex flex-wrap gap-1">

          {club.activities.slice(0, 3).map(
            (activity, index) => (

              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {activity}
              </span>

            )
          )}

        </div>
      )}


      <Link
        to={`/student/clubs/${club.id}`}
        className="btn-primary text-center mt-1"
      >
        View Club
      </Link>

    </div>
  );
}