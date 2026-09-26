import { useEffect, useState } from 'react'
import { fetchClubs } from '../../api/clubs'
import ClubCard from '../../components/ClubCard.jsx'
import Loader from '../../components/Loader.jsx'

export default function ExploreClubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const load = () => {
    setLoading(true)
    fetchClubs({ search: search || undefined, category: category || undefined })
      .then(setClubs)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault()
    load()
  }

  const categories = ['Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'General']

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Explore Clubs</h1>
      <p className="text-gray-500 mb-6">Discover every official club on campus.</p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input-field sm:max-w-xs"
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field sm:max-w-[180px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? <Loader /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((c) => <ClubCard key={c.id} club={c} />)}
          {clubs.length === 0 && <p className="text-gray-500">No clubs match your search.</p>}
        </div>
      )}
    </div>
  )
}