import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecruitments } from "../../api/recruitments";
import { fetchApplications } from "../../api/applications";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";

const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable";
const statusClass = (status = "") => `cs-status cs-status-${status.toLowerCase().replace(/[^a-z]+/g, "-")}`;

export default function ClubDashboard() {
  const { user } = useAuth();
  const [recruitments, setRecruitments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [recruitmentData, applicationData] = await Promise.all([fetchRecruitments(), fetchApplications()]);
        if (active) {
          setRecruitments(Array.isArray(recruitmentData) ? recruitmentData : []);
          setApplications(Array.isArray(applicationData) ? applicationData : []);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.detail || "We couldn't load your club overview. Please refresh to try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => { active = false; };
  }, []);

  if (loading) return <Loader />;

  const activeCount = recruitments.filter((r) => (r.status || "").toLowerCase() === "open").length;
  const pendingCount = applications.filter((a) => ["Applied", "Under Review"].includes(a.status)).length;
  const recent = [...applications].sort((a, b) => new Date(b.applied_at || 0) - new Date(a.applied_at || 0)).slice(0, 5);
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Club team";

  return (
    <main className="page-container cs-dashboard fade-in">
      <div className="cs-eyebrow"><span className="cs-eyebrow-dot" /> MIT-WPU · CLUB OPERATIONS</div>
      <section className="cs-hero cs-admin-hero">
        <div className="cs-hero-copy">
          <p className="cs-overline">THE WORK BEHIND THE WOW</p>
          <h1>Build a club<br /><em>people belong to.</em></h1>
          <p className="cs-hero-description">Welcome back, {firstName}. Keep your recruitment moving, meet your next contributors, and turn good ideas into campus moments.</p>
          <div className="cs-hero-actions"><Link to="/club-admin/recruitments" className="cs-button cs-button-light">Manage recruitment <span aria-hidden="true">↗</span></Link><Link to="/club-admin/applications" className="cs-hero-text-link">Review applications <span>→</span></Link></div>
        </div>
        <div className="cs-hero-art cs-admin-art" aria-hidden="true"><div className="cs-stamp">MAKE<br />IT HAPPEN</div><div className="cs-art-ring" /><div className="cs-art-note"><span>02 /</span> Ideas into<br />impact.</div><div className="cs-art-spark">✳</div></div>
        <span className="cs-hero-index">CLUBSPHERE / CLUB ADMIN</span>
      </section>
      {error && <div className="cs-alert" role="alert">{error}</div>}
      <section className="cs-stat-grid cs-stat-grid-four" aria-label="Club overview">
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon">▤</span><span className="cs-stat-kicker">ALL TIME</span></div><strong>{recruitments.length}</strong><span className="cs-stat-label">Recruitment drives</span><Link to="/club-admin/recruitments" className="cs-stat-link">Manage drives ↗</Link></article>
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon cs-icon-gold">◉</span><span className="cs-stat-kicker">LIVE NOW</span></div><strong>{activeCount}</strong><span className="cs-stat-label">Open recruitments</span><span className="cs-stat-foot">Based on current status</span></article>
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon cs-icon-rust">▧</span><span className="cs-stat-kicker">COMMUNITY</span></div><strong>{applications.length}</strong><span className="cs-stat-label">Applications received</span><Link to="/club-admin/applications" className="cs-stat-link">Meet applicants ↗</Link></article>
        <article className="cs-stat-card"><div className="cs-stat-top"><span className="cs-stat-icon">◷</span><span className="cs-stat-kicker">NEXT UP</span></div><strong>{pendingCount}</strong><span className="cs-stat-label">Awaiting review</span><Link to="/club-admin/applications" className="cs-stat-link">Review queue ↗</Link></article>
      </section>
      <div className="cs-section-heading"><div><p className="cs-overline">PEOPLE MAKE THE CLUB</p><h2>Application desk</h2></div><Link to="/club-admin/applications" className="cs-inline-link">Open all applications <span>→</span></Link></div>
      <section className="cs-content-grid">
        <article className="cs-panel cs-applications-panel"><div className="cs-panel-heading"><div><span className="cs-panel-number">01</span><h3>Recent applicants</h3></div><span className="cs-live-dot">LIVE WORKSPACE</span></div>
          {recent.length ? <div className="cs-application-list">{recent.map((app) => <Link key={app.id} to={`/club-admin/applications/${app.id}`} className="cs-application-row"><div className="cs-application-monogram">{String(app.student_id || "S").slice(-1).toUpperCase()}</div><div className="cs-application-info"><strong>{app.position || "Club application"}</strong><span>Student ID: {app.student_id || "Not provided"} · {dateLabel(app.applied_at)}</span></div><span className={statusClass(app.status)}>{app.status || "Submitted"}</span><span className="cs-row-arrow">↗</span></Link>)}</div> : <div className="cs-empty-state"><span className="cs-empty-mark">✳</span><h4>Your next great member is out there.</h4><p>When applications arrive, you'll find them here. Make sure your recruitment drive is ready to welcome them.</p><Link to="/club-admin/recruitments" className="cs-button cs-button-dark">Manage recruitment <span>→</span></Link></div>}
        </article>
        <aside className="cs-panel cs-discover-panel"><div className="cs-panel-heading"><div><span className="cs-panel-number">02</span><h3>Club toolkit</h3></div></div><p className="cs-discover-intro">A good student experience starts with a well-run club. Your next action is one click away.</p>
          <Link to="/club-admin/recruitments" className="cs-action-tile"><span className="cs-action-icon">＋</span><span><strong>Recruitment drives</strong><small>Create and manage opportunities</small></span><b>↗</b></Link>
          <Link to="/club-admin/profile" className="cs-action-tile"><span className="cs-action-icon cs-action-gold">✎</span><span><strong>Club profile</strong><small>Keep your identity up to date</small></span><b>↗</b></Link>
          <Link to="/club-admin/notifications" className="cs-action-tile"><span className="cs-action-icon cs-action-rust">◎</span><span><strong>Announcements</strong><small>Stay on top of club updates</small></span><b>↗</b></Link>
          <div className="cs-note-card"><span className="cs-note-pin" /><p>Lead with purpose. Make space for new voices.</p><span>— THE CLUBSPHERE WAY</span></div>
        </aside>
      </section>
      <footer className="cs-dashboard-footer"><span>CLUBSPHERE · CAMPUS LIFE, CONNECTED.</span><span>Build something worth joining <b>✳</b></span></footer>
    </main>
  );
}
