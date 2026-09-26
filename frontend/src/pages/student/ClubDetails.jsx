import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchClub } from "../../api/clubs";
import { fetchRecruitments } from "../../api/recruitments";
import RecruitmentCard from "../../components/RecruitmentCard.jsx";
import Loader from "../../components/Loader.jsx";

export default function ClubDetails() {
  const { id } = useParams();

  const [club, setClub] = useState(null);
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubData, recruitmentData] =
          await Promise.all([
            fetchClub(id),
            fetchRecruitments({
              club_id: id,
            }),
          ]);

        setClub(clubData);
        setRecruitments(recruitmentData);

      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);


  if (loading) {
    return <Loader />;
  }


  if (!club) {
    return (
      <div className="page-container">
        Club not found.{" "}
        <Link
          to="/student/clubs"
          className="text-brand-600"
        >
          Go back
        </Link>
      </div>
    );
  }


  return (
    <div className="page-container">

      <div className="card flex flex-col sm:flex-row gap-5 items-start mb-8">

        <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-3xl font-bold overflow-hidden shrink-0">

          {club.logo ? (

            <img
              src={club.logo}
              alt={club.name}
              className="w-full h-full object-cover"
            />

          ) : (

            club.name.charAt(0)

          )}

        </div>


        <div>

          <span className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
            {club.category}
          </span>

          <h1 className="text-2xl font-bold text-gray-800">
            {club.name}
          </h1>

          <p className="text-gray-600 mt-2">
            {club.description ||
              "No description provided yet."}
          </p>

        </div>

      </div>


      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Recruitments from {club.name}
      </h2>


      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {recruitments.map((recruitment) => (

          <RecruitmentCard
            key={recruitment.id}
            recruitment={recruitment}
          />

        ))}


        {recruitments.length === 0 && (

          <p className="text-gray-500">
            No recruitments posted yet.
          </p>

        )}

      </div>

    </div>
  );
}