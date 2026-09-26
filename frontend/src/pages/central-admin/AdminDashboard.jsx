import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats } from '../../api/notifications'
import Loader from '../../components/Loader.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!stats) return null

  const cards = [
    { label: 'Total Clubs', value: stats.total_clubs, link: '/central-admin/clubs' },
    { label: 'Students', value: stats.total_students },
    { label: 'Club Admins', value: stats.total_club_admins, link: '/central-admin/users' },
    { label: 'Active Recruitments', value: stats.active_recruitments, link: '/central-admin/recruitments' },
    { label: 'Total Recruitments', value: stats.total_recruitments },
    { label: 'Total Applications', value: stats.total_applications, link: '/central-admin/applications' },
  ]

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Central Admin Dashboard</h1>
      <p className="text-gray-500 mb-6">Official oversight of every club, recruitment, and application.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => {
          const Wrapper = c.link ? Link : 'div'
          return (
            <Wrapper key={c.label} to={c.link} className="card text-center hover:shadow-md transition-shadow">
              <p className="text-3xl font-extrabold text-brand-700">{c.value}</p>
              <span className="text-sm text-gray-500">{c.label}</span>
            </Wrapper>
          )
        })}
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">Application Status Breakdown</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(stats.status_breakdown).map(([status, count]) => {
            const max = Math.max(...Object.values(stats.status_breakdown), 1)
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-32 text-sm text-gray-600">{status}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-brand-600 h-3 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="w-8 text-sm text-gray-700 font-semibold text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}