import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/apiClient'
import Loader from '../../components/Loader.jsx'

const EMPTY_STATS = {
  users: { total: 0, students: 0, club_admins: 0, central_admins: 0 },
  clubs: { total: 0, approved: 0, pending: 0, rejected: 0 },
  recruitments: { total: 0, open: 0, closed: 0 },
  applications: {
    total: 0,
    applied: 0,
    under_review: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
  },
}

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

function StatCard({ label, value, to, detail }) {
  const content = (
    <div className="card h-full text-left transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-brand-700">{number(value).toLocaleString()}</p>
      {detail ? <p className="mt-2 text-xs text-gray-500">{detail}</p> : null}
    </div>
  )

  return to ? (
    <Link to={to} className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" aria-label={`${label}: ${number(value)}`}>
      {content}
    </Link>
  ) : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      // Existing backend Central Admin statistics endpoint.
      const response = await apiClient.get('/users/admin/stats/')
      const data = response?.data ?? {}

      setStats({
        users: { ...EMPTY_STATS.users, ...(data.users ?? {}) },
        clubs: { ...EMPTY_STATS.clubs, ...(data.clubs ?? {}) },
        recruitments: { ...EMPTY_STATS.recruitments, ...(data.recruitments ?? {}) },
        applications: { ...EMPTY_STATS.applications, ...(data.applications ?? {}) },
      })
    } catch (err) {
      console.error('Failed to load Central Admin dashboard statistics:', err)
      setError(
        err?.response?.status === 401
          ? 'Your session may have expired. Please log in again.'
          : err?.response?.status === 403
            ? 'Only a Central Admin can view these statistics.'
            : 'We could not load dashboard statistics. Check that the backend is running, then try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (loading) return <Loader />

  const cards = [
    { label: 'Registered Students', value: stats.users.students, to: '/central-admin/users', detail: `${number(stats.users.total)} total platform users` },
    { label: 'Total Clubs', value: stats.clubs.total, to: '/central-admin/clubs', detail: `${number(stats.clubs.approved)} approved` },
    { label: 'Pending Club Approvals', value: stats.clubs.pending, to: '/central-admin/clubs', detail: `${number(stats.clubs.rejected)} rejected` },
    { label: 'Active Recruitments', value: stats.recruitments.open, to: '/central-admin/recruitments', detail: `${number(stats.recruitments.closed)} closed` },
    { label: 'Total Applications', value: stats.applications.total, to: '/central-admin/applications', detail: 'Across all clubs and drives' },
    { label: 'Club Admins', value: stats.users.club_admins, to: '/central-admin/users', detail: `${number(stats.users.central_admins)} central admins` },
  ]

  const statusRows = [
    { label: 'Applied', value: stats.applications.applied, color: 'bg-blue-500' },
    { label: 'Under Review', value: stats.applications.under_review, color: 'bg-amber-500' },
    { label: 'Shortlisted', value: stats.applications.shortlisted, color: 'bg-violet-500' },
    { label: 'Selected', value: stats.applications.selected, color: 'bg-emerald-500' },
    { label: 'Rejected', value: stats.applications.rejected, color: 'bg-rose-500' },
  ]
  const maxStatusCount = Math.max(...statusRows.map((row) => number(row.value)), 1)

  return (
    <main className="page-container space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-700">Platform overview</p>
          <h1 className="text-2xl font-bold text-gray-800">Central Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">Monitor clubs, recruitment drives, students and applications across ClubSphere.</p>
        </div>
        <button type="button" onClick={loadStats} className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:self-auto">
          Refresh statistics
        </button>
      </header>

      {error ? (
        <section role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p>{error}</p>
          <button type="button" onClick={loadStats} className="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 font-semibold hover:bg-rose-100">
            Try again
          </button>
        </section>
      ) : null}

      <section aria-label="Platform statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Application Status Breakdown</h2>
              <p className="mt-1 text-sm text-gray-500">Current application counts by status.</p>
            </div>
            <Link to="/central-admin/applications" className="text-sm font-semibold text-brand-700 hover:underline">View applications</Link>
          </div>

          {stats.applications.total === 0 ? (
            <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">No applications have been submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {statusRows.map((row) => {
                const count = number(row.value)
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-gray-600">{row.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800">Club Approval Overview</h2>
            <p className="mt-1 text-sm text-gray-500">Track club registration decisions.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Approved', value: stats.clubs.approved, style: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
              { label: 'Pending', value: stats.clubs.pending, style: 'border-amber-200 bg-amber-50 text-amber-800' },
              { label: 'Rejected', value: stats.clubs.rejected, style: 'border-rose-200 bg-rose-50 text-rose-800' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 ${item.style}`}>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-2 text-2xl font-bold">{number(item.value).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <Link to="/central-admin/clubs" className="mt-5 inline-flex text-sm font-semibold text-brand-700 hover:underline">Manage clubs →</Link>
        </div>
      </section>
    </main>
  )
}
