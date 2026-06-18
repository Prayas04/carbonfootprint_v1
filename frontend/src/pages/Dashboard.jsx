import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDashboard } from '../api/dashboard.js'
import './Dashboard.css'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', active: true },
  { icon: 'history', label: 'Activity Logs', path: '/activity' },
  { icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet' },
]

export default function Dashboard() {
  const { logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getDashboard()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const globalImpact = data?.global_impact || { total_co2e_kg: 0, trend_data: [] }
  const telemetry = data?.telemetry || { tracker_status: '—', gps_precision: '—', sync_rate_hz: 0 }
  const budget = data?.budget || { cycle_name: '—', total_kg: 0, used_kg: 0, remaining_kg: 0, percent_used: 0 }
  const recentEvents = data?.recent_events || []

  return (
    <div className="dashboard-root bg-background text-on-background font-sans antialiased min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* ── SideNavBar ── */}
      <nav className="hidden md:flex flex-col h-full py-stack-lg fixed left-0 top-0 w-[280px] bg-surface border-r border-surface-container-highest z-50">
        {/* Brand Header */}
        <div className="px-container-padding mb-stack-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <h1 className="text-headline-md font-bold text-primary tracking-tight">CarbonTrack</h1>
            <p className="text-label-caps text-on-surface-variant mt-1 uppercase">Enterprise Console</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={
                item.active
                  ? 'flex items-center gap-3 px-3 py-2.5 rounded hover:bg-surface-container-low transition-colors text-primary font-bold border-r-2 border-primary bg-surface-container opacity-80 scale-[0.99] transition-all'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant font-medium'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="px-container-padding mt-stack-md mb-stack-lg">
          <button className="w-full bg-primary-container text-on-primary-container text-body-sm font-semibold py-2.5 rounded shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Report
          </button>
        </div>

        {/* Footer Nav */}
        <div className="mt-auto flex flex-col gap-1 px-3 border-t border-surface-container-highest pt-stack-md">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-body-sm">Settings</span>
          </a>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant w-full text-left">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-body-sm">Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen">
        {/* TopAppBar */}
        <header className="flex items-center justify-between h-14 px-container-padding w-full z-40 bg-surface border-b border-surface-container-highest sticky top-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-64 md:w-96 focus-within:ring-1 focus-within:ring-primary rounded-md transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="w-full bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-on-surface-variant border border-surface-container-highest rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-primary-container bg-transparent"
                placeholder="Search metrics..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </button>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-container-padding overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-64 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading dashboard data...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-64 text-error gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}
          {!loading && !error && (
          <div className="flex flex-col gap-gutter">

            {/* ── Top Row: Impact & Telemetry ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">

              {/* Global Impact Summary */}
              <div className="xl:col-span-8 bento-card p-container-padding flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container/5 to-transparent pointer-events-none"></div>
                <div className="z-10">
                  <h2 className="text-label-caps text-on-surface-variant uppercase mb-2">Global Impact Summary</h2>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-display-lg text-primary-container tracking-tighter">{globalImpact.total_co2e_kg.toLocaleString()}</span>
                    <span className="text-headline-sm text-on-surface-variant">kg CO2e</span>
                  </div>
                </div>
                <div className="h-32 w-full mt-auto relative z-10">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="400" y1="25" y2="25" />
                    <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="400" y1="50" y2="50" />
                    <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="400" y1="75" y2="75" />
                    <path className="sparkline" d="M0,80 Q50,70 100,85 T200,60 T300,75 T400,40" fill="none" stroke="#2e3447" strokeWidth="1.5" />
                    <path className="sparkline" d="M0,60 Q50,55 100,70 T200,40 T300,55 T400,20" fill="none" stroke="#6ffbbe" strokeWidth="2" style={{ animationDelay: '0.2s' }} />
                    <path d="M0,60 Q50,55 100,70 T200,40 T300,55 T400,20 L400,100 L0,100 Z" fill="url(#sparkGradient)" opacity="0.1" />
                    <defs>
                      <linearGradient id="sparkGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#4edea3" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0c1324" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex justify-between mt-2 text-label-caps text-on-surface-variant opacity-60">
                    <span>30D Trend</span>
                    <span>Current</span>
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Grid */}
              <div className="xl:col-span-4 grid grid-cols-2 gap-gutter h-full">
                <div className="bento-card p-4 flex flex-col justify-center items-center text-center">
                  <span className="material-symbols-outlined text-secondary-container mb-2" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>sensors</span>
                  <span className="text-data-lg font-mono text-on-surface">{telemetry.tracker_status}</span>
                  <span className="text-label-caps text-on-surface-variant uppercase mt-1">Tracker Status</span>
                </div>
                <div className="bento-card p-4 flex flex-col justify-center items-center text-center">
                  <span className="material-symbols-outlined text-primary-container mb-2" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>my_location</span>
                  <span className="text-data-lg font-mono text-on-surface">{telemetry.gps_precision}</span>
                  <span className="text-label-caps text-on-surface-variant uppercase mt-1">GPS Precision</span>
                </div>
                <div className="bento-card p-4 flex flex-col justify-center items-center text-center col-span-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
                    </span>
                    <span className="text-data-lg font-mono text-on-surface">{telemetry.sync_rate_hz}Hz</span>
                  </div>
                  <span className="text-label-caps text-on-surface-variant uppercase">Sync Rate</span>
                </div>
              </div>
            </div>

            {/* ── Middle Row: Active Budget & Activity ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">

              {/* Active Budget */}
              <div className="xl:col-span-4 bento-card p-container-padding flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-label-caps text-on-surface-variant uppercase">Active Budget</h2>
                  <span className="text-label-caps bg-surface-container-high px-2 py-1 rounded text-on-surface">{budget.cycle_name}</span>
                </div>
                <div className="mb-4 flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-headline-md text-on-surface">
                      {budget.used_kg.toLocaleString()}<span className="text-body-sm text-on-surface-variant ml-1">kg used</span>
                    </span>
                    <span className="text-body-md text-on-surface-variant">/ {budget.total_kg.toLocaleString()} kg</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-secondary-container rounded-full progress-bar-fill" style={{ width: `${budget.percent_used}%` }}></div>
                  </div>
                  <div className="flex justify-between text-data-sm font-mono text-on-surface-variant">
                    <span>{budget.percent_used}% Consumed</span>
                    <span>{budget.remaining_kg.toLocaleString()} kg Remaining</span>
                  </div>
                </div>
                <button className="w-full mt-auto py-2 border border-surface-container-highest rounded text-body-sm text-on-surface hover:bg-surface-container-high transition-colors">
                  Request Extension
                </button>
              </div>

              {/* Recent Activity Feed */}
              <div className="xl:col-span-8 bento-card overflow-hidden flex flex-col">
                <div className="p-container-padding border-b border-surface-container-highest flex justify-between items-center bg-surface-container/50">
                  <h2 className="text-label-caps text-on-surface-variant uppercase">Recent Transit Events</h2>
                  <Link to="/activity" className="text-body-sm text-primary hover:text-primary-fixed transition-colors">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-container-highest bg-surface-container/30">
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase">Mode</th>
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase">Distance</th>
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase">Duration</th>
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase text-right">CO2e Impact</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm">
                      {recentEvents.map((event, i) => (
                        <tr
                          key={i}
                          className={`hover:bg-surface-container-high/30 transition-colors ${i < recentEvents.length - 1 ? 'border-b border-surface-container-highest/50' : ''}`}
                        >
                          <td className="px-6 py-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>{event.icon}</span>
                            <span className={`text-on-surface font-medium ${!event.positive ? 'opacity-70' : ''}`}>{event.mode}</span>
                          </td>
                          <td className={`px-6 py-4 text-data-sm font-mono text-on-surface-variant ${!event.positive ? 'opacity-70' : ''}`}>{event.distance}</td>
                          <td className={`px-6 py-4 text-data-sm font-mono text-on-surface-variant ${!event.positive ? 'opacity-70' : ''}`}>{event.duration}</td>
                          <td className={`px-6 py-4 text-data-sm font-mono text-right ${event.positive ? 'text-secondary' : 'text-error'}`}>
                            {event.impact_kg > 0 ? '+' : ''}{event.impact_kg} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
          )}
        </main>
      </div>
    </div>
  )
}
