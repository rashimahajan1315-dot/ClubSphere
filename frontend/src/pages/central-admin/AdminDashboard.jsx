import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStats } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchStats()
      .then((data) => { if (active) setStats(data); })
      .catch((err) => { if (active) setError(err.response?.data?.detail || "We couldn't load institutional statistics. Please refresh to try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loader />;
  const data = stats || {};
  const cards = [
    { label: "Registered clubs", value: data.total_clubs ?? "—", note: "Campus communities", icon: "⌘", link: "/central-admin/clubs", tone: "" },
    { label: "Students", value: data.total_students ?? "—", note: "Student community", icon: "♙", tone: "gold" },
    { label: "Club administrators", value: data.total_club_admins ?? "—", note: "Club leadership", icon: "♧", link: "/central-admin/users", tone: "rust" },
    { label: "Open recruitments", value: data.active_recruitments ?? "—", note: "Currently accepting", icon: "◉", link: "/central-admin/recruitments", tone: "" },
    { label: "Recruitment drives", value: data.total_recruitments ?? "—", note: "All recorded drives", icon: "▤", tone: "gold" },
    { label: "Applications", value: data.total_applications ?? "—", note: "Across the platform", icon: "▧", link: "/central-admin/applications", tone: "rust" },
  ];
  const breakdown = data.status_breakdown && typeof data.status_breakdown === "object" ? Object.entries(data.status_breakdown) : [];
  const maxStatus = Math.max(...breakdown.map(([, count]) => Number(count) || 0), 1);
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Administrator";

  return (
    <main className="page-container cs-dashboard fade-in">
      <div className="cs-eyebrow"><span className="cs-eyebrow-dot" /> MIT-WPU · INSTITUTIONAL OVERVIEW</div>
      <section className="cs-hero cs-central-hero">
        <div className="cs-hero-copy"><p className="cs-overline">ONE CAMPUS. MANY COMMUNITIES.</p><h1>See the whole<br /><em>campus come alive.</em></h1><p className="cs-hero-description">Welcome, {firstName}. Your overview of the people, clubs, and opportunities shaping campus life at MIT-WPU.</p><div className="cs-hero-actions"><Link to="/central-admin/clubs" className="cs-button cs-button-light">Explore club directory <span>↗</span></Link><Link to="/central-admin/users" className="cs-hero-text-link">Manage users <span>→</span></Link></div></div>
        <div className="cs-hero-art cs-central-art" aria-hidden="true"><div className="cs-stamp">CAMPUS<br />IN FOCUS</div><div className="cs-art-ring" /><div className="cs-art-note"><span>03 /</span> The bigger<br />picture.</div><div className="cs-art-spark">✳</div></div>
        <span className="cs-hero-index">CLUBSPHERE / CENTRAL ADMIN</span>
      </section>
      {error && <div className="cs-alert" role="alert">{error}</div>}
      <div className="cs-section-heading"><div><p className="cs-overline">THE NUMBERS THAT MATTER</p><h2>Campus at a glance</h2></div><span className="cs-data-note"><span className="cs-live-dot" /> LIVE PLATFORM DATA</span></div>
      <section className="cs-stat-grid cs-admin-stats" aria-label="Institutional statistics">{cards.map((card) => { const Content = <><div className="cs-stat-top"><span className={`cs-stat-icon ${card.tone ? `cs-icon-${card.tone}` : ""}`}>{card.icon}</span><span className="cs-stat-kicker">MIT-WPU</span></div><strong>{card.value}</strong><span className="cs-stat-label">{card.label}</span><span className="cs-stat-foot">{card.note}</span></>; return card.link ? <Link key={card.label} to={card.link} className="cs-stat-card cs-stat-card-link">{Content}<span className="cs-card-corner">↗</span></Link> : <article key={card.label} className="cs-stat-card">{Content}</article>; })}</section>
      <div className="cs-section-heading"><div><p className="cs-overline">KEEP THINGS MOVING</p><h2>Institutional control room</h2></div></div>
      <section className="cs-content-grid cs-central-content">
        <article className="cs-panel"><div className="cs-panel-heading"><div><span className="cs-panel-number">01</span><h3>Application pulse</h3></div><Link to="/central-admin/applications" className="cs-inline-link">View applications →</Link></div>
          {breakdown.length ? <div className="cs-breakdown-list">{breakdown.map(([status, count]) => <div className="cs-breakdown-row" key={status}><div className="cs-breakdown-label"><span>{status}</span><strong>{count}</strong></div><div className="cs-breakdown-track"><span style={{ width: `${Math.min(100, ((Number(count) || 0) / maxStatus) * 100)}%` }} /></div></div>)}</div> : <div className="cs-empty-state cs-empty-compact"><span className="cs-empty-mark">◷</span><h4>Application data will appear here.</h4><p>The status breakdown will populate when the statistics endpoint returns application counts.</p></div>}
        </article>
        <aside className="cs-panel cs-discover-panel"><div className="cs-panel-heading"><div><span className="cs-panel-number">02</span><h3>Administration</h3></div></div><p className="cs-discover-intro">Keep the campus ecosystem healthy with a clear view of its communities and people.</p>
          <Link to="/central-admin/clubs" className="cs-action-tile"><span className="cs-action-icon">⌘</span><span><strong>Club directory</strong><small>Review registered communities</small></span><b>↗</b></Link>
          <Link to="/central-admin/users" className="cs-action-tile"><span className="cs-action-icon cs-action-gold">♙</span><span><strong>User management</strong><small>Students and club admins</small></span><b>↗</b></Link>
          <Link to="/central-admin/recruitments" className="cs-action-tile"><span className="cs-action-icon cs-action-rust">▤</span><span><strong>Recruitment oversight</strong><small>View platform recruitment drives</small></span><b>↗</b></Link>
          <Link to="/central-admin/applications" className="cs-action-tile"><span className="cs-action-icon">▧</span><span><strong>Applications</strong><small>Review platform activity</small></span><b>↗</b></Link>
        </aside>
      </section>
      <footer className="cs-dashboard-footer"><span>CLUBSPHERE · CAMPUS LIFE, CONNECTED.</span><span>One campus, shared purpose <b>✳</b></span></footer>
    </main>
  );
}
