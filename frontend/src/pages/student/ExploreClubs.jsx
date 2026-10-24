import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClubs } from "../../api/clubs";
import ClubCard from "../../components/ClubCard.jsx";
import Loader from "../../components/Loader.jsx";

const categories = [
  { label: "Technical", value: "TECHNOLOGY" },
  { label: "Cultural", value: "CULTURAL" },
  { label: "Sports", value: "SPORTS" },
  { label: "Literary", value: "LITERARY" },
  { label: "Social service", value: "SOCIAL" },
  { label: "General", value: "GENERAL" },
];

export default function ExploreClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const load = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchClubs(params);
      setClubs(Array.isArray(result) ? result : result?.results || []);
    } catch (err) {
      setError(err?.response?.data?.detail || "We couldn't load clubs right now. Please try again.");
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (event) => {
    event.preventDefault();
    load({ search: search.trim() || undefined, category: category || undefined });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    load();
  };

  return (
    <div className="page-container explore-page">
      <section className="explore-hero">
        <div className="explore-hero-copy">
          <span className="eyebrow hero-eyebrow">FIND YOUR PEOPLE</span>
          <h1>Campus life starts <span>with community.</span></h1>
          <p>Discover clubs, explore your interests, and find the people who make university unforgettable.</p>
          <div className="hero-trust"><span>✦</span> Explore communities at MIT World Peace University</div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="orbit-center">C<span>+</span></div>
          <span className="orbit-chip chip-one">✦</span><span className="orbit-chip chip-two">♫</span><span className="orbit-chip chip-three">⌘</span>
        </div>
      </section>

      <div className="directory-heading">
        <div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Explore clubs</h2><p>There's a community for every curiosity.</p></div>
        <span className="directory-count">{clubs.length} {clubs.length === 1 ? "club" : "clubs"} found</span>
      </div>

      <form onSubmit={handleSearch} className="directory-toolbar">
        <label className="search-control"><span aria-hidden="true">⌕</span><input aria-label="Search clubs" placeholder="Search by club name or interest..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label className="category-control"><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button type="submit" className="btn-primary">Search clubs</button>
      </form>

      {error && <div className="directory-error" role="alert"><strong>Something went wrong.</strong><span>{error}</span><button type="button" className="btn-secondary" onClick={() => load({ search: search.trim() || undefined, category: category || undefined })}>Try again</button></div>}
      {loading ? <Loader /> : (
        <>
          <div className="club-grid">
            {clubs.map((club) => <ClubCard key={club.id} club={club} />)}
          </div>
          {!clubs.length && !error && <div className="directory-empty"><div className="empty-symbol">⌕</div><h3>No clubs found just yet</h3><p>Try another search or clear your filters to explore all campus communities.</p><button type="button" className="btn-secondary" onClick={resetFilters}>Clear filters</button></div>}
        </>
      )}
      <div className="directory-bottom-note">Already part of a club? <Link to="/student/applications">Check your applications <span aria-hidden="true">→</span></Link></div>
    </div>
  );
}
