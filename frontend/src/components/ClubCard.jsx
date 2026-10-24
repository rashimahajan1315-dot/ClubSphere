import { Link } from "react-router-dom";
import ClubLogo from "./ClubLogo.jsx";

export default function ClubCard({ club }) {
  return (
    <article className="card club-card">
      <div className="club-card-topline" />
      <div className="club-card-heading">
        <ClubLogo club={club} />
        <div className="club-card-title">
          <span className="eyebrow">{club.category || "Campus community"}</span>
          <h3>{club.name || "Untitled club"}</h3>
        </div>
      </div>
      <p className="club-card-description">{club.description || "A place to meet people, learn together, and turn shared interests into something meaningful."}</p>
      {club.activities?.length > 0 && (
        <div className="club-tags">
          {club.activities.slice(0, 3).map((activity, index) => <span key={`${activity}-${index}`}>{activity}</span>)}
        </div>
      )}
      <div className="club-card-footer">
        <span className="club-community-label"><span className="online-dot" /> Campus community</span>
        <Link to={`/student/clubs/${club.id}`} className="btn-primary club-details-link">Explore club <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
