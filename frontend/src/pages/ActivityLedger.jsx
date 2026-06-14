import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getMetrics, getEvents } from '../api/activity.js'
import './ActivityLedger.css'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'history', label: 'Activity Logs', path: '/activity', active: true },
  { icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet' },
  { icon: 'data_check', label: 'System Status', path: '/system' },
]

export default function ActivityLedger() {
  const { logout } = useAuth()
  const [metrics, setMetrics] = useState([])
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, per_page: 10, total_items: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [modeFilter, setModeFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [metricsData, eventsData] = await Promise.all([
        getMetrics(),
        getEvents({ page: currentPage, per_page: 10, mode: modeFilter || undefined }),
      ])
      setMetrics(metricsData.metrics)
      setRows(eventsData.data)
      setPagination(eventsData.pagination)
    } catch (err) {
      console.error('Failed to fetch activity data:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, modeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = pagination.total_pages
  const pageNumbers = []
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pageNumbers.push(i)

  return (
    <div className="activity-ledger-root bg-background text-on-background font-sans antialiased overflow-hidden">
      {/* ── TopAppBar ── */}
      <header className="fixed top-0 w-full z-40 bg-surface border-b border-surface-container-highest flex items-center justify-between h-14 pl-[280px] pr-container-padding">
        <div className="flex items-center bg-surface-container-low border border-surface-container-highest rounded px-stack-sm py-1 max-w-md w-full focus-within:ring-1 focus-within:ring-primary transition-all">
          <span className="material-symbols-outlined text-on-surface-variant mr-stack-sm">search</span>
          <input
            className="bg-transparent border-none text-body-sm text-on-surface w-full focus:outline-none focus:ring-0 placeholder-on-surface-variant"
            placeholder="Search resources..."
            type="text"
          />
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

      {/* ── Main Content Canvas ── */}
      <main className="ml-[280px] pt-14 h-screen overflow-y-auto bg-background p-container-padding flex flex-col gap-gutter">
        {/* Header Actions */}
        <div className="flex items-end justify-between mb-stack-sm">
          <div>
            <h2 className="text-headline-md text-on-surface mb-1">Activity Ledger</h2>
            <p className="text-body-sm text-on-surface-variant">Detailed transit and logistics emission tracking.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2">
              API Access
            </button>
            <button className="bg-transparent border border-surface-container-highest text-on-surface text-body-sm px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export PDF/CSV
            </button>
          </div>
        </div>

        {/* Metrics Ribbon */}
        <div className="grid grid-cols-3 gap-gutter">
          {metrics.map((m) => (
            <div key={m.label} className="bg-surface-container-low border border-surface-container-highest rounded-lg p-stack-md flex flex-col gap-2">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="text-label-caps">{m.label}</span>
                <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-headline-md text-on-surface">{m.value}</span>
                <span className="text-data-sm font-mono text-on-surface-variant">{m.unit}</span>
              </div>
              <div className={`text-label-caps ${m.trend_color} mt-1 flex items-center gap-1`}>
                {m.trend_icon && <span className="material-symbols-outlined text-[14px]">{m.trend_icon}</span>}
                {m.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-3 flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-surface-container-highest pr-4">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">filter_list</span>
            <span className="text-label-caps text-on-surface-variant">Filters</span>
          </div>
          {/* Date Range */}
          <div className="flex items-center gap-2 bg-background border border-surface-container-highest rounded px-3 py-1.5">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">calendar_today</span>
            <span className="text-data-sm font-mono text-on-surface">Oct 01 - Oct 07, 2023</span>
          </div>
          {/* Mode Filter */}
          <select
            className="bg-background border border-surface-container-highest rounded px-3 py-1.5 text-data-sm font-mono text-on-surface cursor-pointer hover:border-outline transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Modes</option>
            <option value="Freight">Freight</option>
            <option value="Fleet">Fleet</option>
            <option value="Courier">Courier</option>
            <option value="Transit">Transit</option>
            <option value="Commuter Rail">Commuter Rail</option>
            <option value="E-Bike">E-Bike</option>
          </select>
          {/* Impact Threshold */}
          <div className="flex items-center gap-3 ml-auto text-data-sm font-mono text-on-surface-variant">
            <span>Impact &gt;</span>
            <input
              className="w-16 bg-background border border-surface-container-highest rounded px-2 py-1 text-center focus:outline-none focus:border-primary text-on-surface"
              type="text"
              defaultValue="0 kg"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-surface-container border border-surface-container-highest rounded-lg overflow-hidden flex-1 flex flex-col min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading events...
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-container-highest text-label-caps text-on-surface-variant">
                  <th className="py-3 px-4 font-normal">Timestamp</th>
                  <th className="py-3 px-4 font-normal">Mode</th>
                  <th className="py-3 px-4 font-normal w-24">Route</th>
                  <th className="py-3 px-4 font-normal">Origin / Destination</th>
                  <th className="py-3 px-4 font-normal text-right">Distance</th>
                  <th className="py-3 px-4 font-normal text-right">Duration</th>
                  <th className="py-3 px-4 font-normal text-right">Impact (kg CO2e)</th>
                </tr>
              </thead>
              <tbody className="text-data-sm font-mono text-on-surface">
                {rows.map((row, i) => (
                  <tr key={row.id || i} className="border-b border-surface-container-highest hover:bg-surface-container-low transition-colors group cursor-default">
                    <td className="py-3 px-4 text-on-surface-variant">{row.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">{row.mode_icon}</span>
                        </div>
                        {row.mode}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-16 h-8 bg-surface-container-highest rounded border border-surface-container-highest overflow-hidden relative">
                        {/* Route map placeholder */}
                        <div className="absolute inset-0 bg-surface-container-high opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span>{row.origin}</span>
                        <span className="text-on-surface-variant">{row.destination}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">{row.distance}</td>
                    <td className="py-3 px-4 text-right text-on-surface-variant">{row.duration}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={row.impact_color}>{row.impact}</span>
                        <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${row.bar_color} rounded-full`} style={{ width: row.bar_width }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="mt-auto border-t border-surface-container-highest p-3 flex items-center justify-between bg-surface-container-high text-on-surface-variant">
            <span className="text-data-sm font-mono">
              Showing {((currentPage - 1) * pagination.per_page) + 1}-{Math.min(currentPage * pagination.per_page, pagination.total_items)} of {pagination.total_items.toLocaleString()} records
            </span>
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {pageNumbers.map(n => (
                <button
                  key={n}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${n === currentPage ? 'bg-surface-container-highest text-on-surface' : 'hover:bg-surface-container-highest'}`}
                  onClick={() => setCurrentPage(n)}
                >
                  <span className="text-data-sm font-mono">{n}</span>
                </button>
              ))}
              <button
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
