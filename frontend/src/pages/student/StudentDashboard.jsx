import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClubs } from "../../api/clubs";
import { fetchApplications } from "../../api/applications";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";

const shortDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable";
const statusClass = (status = "") => `cs-status cs-status-${status.toLowerCase().replace(/[^a-z]+/g, "-")}`;

export default function StudentDashboard() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [clubData, applicationData] = await Promise.all([
          fetchClubs(),
          user?.id ? fetchApplications({ student_id: user.id }) : Promise.resolve([]),
        ]);
        if (active) {
          setClubs(Array.isArray(clubData) ? clubData : []);
          setApplications(Array.isArray(applicationData) ? applicationData : []);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.detail || "We couldn't load your campus overview. Please refresh to try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => { active = false; };
  }, [user?.id]);

  if (loading) return <Loader />;

  const pending = applications.filter((a) => ["Applied", "Under Review"].includes(a.status)).length;
  const selected = applications.filter((a) => a.status === "Selected").length;
  const recent = [...applications].sort((a, b) => new Date(b.applied_at || 0) - new Date(a.applied_at || 0)).slice(0, 4);
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <main className="page-container cs-dashboard fade-in">
      <div className="cs-eyebrow"><span className="cs-eyebrow-dot" /> MIT-WPU · CAMPUS LIFE</div>
      <section className="cs-hero cs-student-hero">
        <div className="cs-hero-copy">
          <p className="cs-overline">YOUR CAMPUS, YOUR STORY</p>
          <h1>Make this semester<br /><em>mean something.</em></h1>
          <p className="cs-hero-description">Good to see you, {firstName}. Find your people, follow your curiosity, and make room for something new.</p>
          <div className="cs-hero-actions">
            <Link to="/student/clubs" className="cs-button cs-button-light">Explore clubs <span aria-hidden="true">↗</span></Link>
            <Link to="/student/applications" className="cs-hero-text-link">Track my applications <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="cs-hero-art" aria-hidden="true">
          <div className="cs-stamp">CAMPUS<br />COLLECTIVE</div>
          <div className="cs-art-ring" />
          <div className="cs-art-note"><span>01 /</span> Find your<br />next chapter.</div>
          <div className="cs-art-spark">✳</div>
        </div>
        <span className="cs-hero-index">CLUBSPHERE / STUDENT</span>
      </section>

      {error && <div className="cs-alert" role="alert">{error}</div>}

      <section className="cs-stat-grid" aria-label="Your activity">
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon">⌘</span><span className="cs-stat-kicker">DISCOVER</span></div><strong>{clubs.length}</strong><span className="cs-stat-label">Clubs to explore</span><Link to="/student/clubs" className="cs-stat-link">Find your community ↗</Link></article>
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon cs-icon-gold">✳</span><span className="cs-stat-kicker">IN PROGRESS</span></div><strong>{applications.length}</strong><span className="cs-stat-label">Your applications</span><Link to="/student/applications" className="cs-stat-link">View applications ↗</Link></article>
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon cs-icon-rust">◷</span><span className="cs-stat-kicker">AWAITING UPDATE</span></div><strong>{pending}</strong><span className="cs-stat-label">Pending review</span><span className="cs-stat-foot">{selected} selected so far</span></article>
      </section>

      <div className="cs-section-heading"><div><p className="cs-overline">KEEP YOUR MOMENTUM</p><h2>Your campus activity</h2></div><Link to="/student/applications" className="cs-inline-link">All applications <span>→</span></Link></div>
      <section className="cs-content-grid">
        <article className="cs-panel cs-applications-panel">
          <div className="cs-panel-heading"><div><span className="cs-panel-number">01</span><h3>Recent applications</h3></div><span className="cs-live-dot">UP TO DATE</span></div>
          {recent.length ? <div className="cs-application-list">{recent.map((app) => <Link key={app.id} to="/student/applications" className="cs-application-row"><div className="cs-application-monogram">{(app.position || "C").charAt(0).toUpperCase()}</div><div className="cs-application-info"><strong>{app.position || "Club application"}</strong><span>Submitted {shortDate(app.applied_at)}</span></div><span className={statusClass(app.status)}>{app.status || "Submitted"}</span><span className="cs-row-arrow">↗</span></Link>)}</div> : <div className="cs-empty-state"><span className="cs-empty-mark">✳</span><h4>Your next chapter starts here.</h4><p>You haven't applied to a club yet. Explore communities and find one that feels right.</p><Link to="/student/clubs" className="cs-button cs-button-dark">Explore clubs <span>→</span></Link></div>}
        </article>
        <aside className="cs-panel cs-discover-panel">
          <div className="cs-panel-heading"><div><span className="cs-panel-number">02</span><h3>Make a move</h3></div></div>
          <p className="cs-discover-intro">The best campus memories rarely happen by accident. Start with one small step.</p>
          <Link to="/student/clubs" className="cs-action-tile"><span className="cs-action-icon">✳</span><span><strong>Find your people</strong><small>Browse student communities</small></span><b>↗</b></Link>
          <Link to="/student/applications" className="cs-action-tile"><span className="cs-action-icon cs-action-gold">↗</span><span><strong>Check your progress</strong><small>See your application status</small></span><b>↗</b></Link>
          <div className="cs-note-card"><span className="cs-note-pin" /><p>“A campus becomes a community when you show up.”</p><span>— YOUR REMINDER TO GET INVOLVED</span></div>
        </aside>
      </section>
      <footer className="cs-dashboard-footer"><span>CLUBSPHERE · CAMPUS LIFE, CONNECTED.</span><span>Made for curious minds <b>✳</b></span></footer>
    </main>
  );
}
