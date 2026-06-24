import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getMetrics, getEvents } from '../api/activity.js'
import { useDialog } from '../context/DialogContext.jsx'
import Layout from '../components/Layout.jsx'
import './ActivityLedger.css'

const CATEGORY_MODES = [
  { label: 'Transit', options: [{val: 'Walk', text: '🚶 Walk'}, {val: 'Bike', text: '🚴 Bike'}, {val: 'Transit', text: '🚌 Transit'}, {val: 'Train', text: '🚆 Train'}, {val: 'Carpool', text: '🚕 Carpool'}, {val: 'Car', text: '🚗 Car'}, {val: 'Flight', text: '✈️ Flight'}] },
  { label: 'Diet', options: [{val: 'Vegan', text: '🌱 Vegan'}, {val: 'Vegetarian', text: '🥗 Vegetarian'}, {val: 'Pescatarian', text: '🐟 Pescatarian'}, {val: 'Meat', text: '🥩 Meat'}] },
  { label: 'Energy', options: [{val: 'Electricity', text: '⚡ Electricity'}, {val: 'Heating', text: '🔥 Heating'}] },
  { label: 'Shopping', options: [{val: 'Clothing', text: '👕 Clothing'}, {val: 'Electronics', text: '💻 Electronics'}] }
];

export default function ActivityLedger() {
  const [metrics, setMetrics] = useState([])
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, per_page: 10, total_items: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [modeFilter, setModeFilter] = useState('')
  const [expandedRowId, setExpandedRowId] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [impactThreshold, setImpactThreshold] = useState(0)
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const dropdownRef = useRef(null)
  const { showAlert } = useDialog()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [metricsData, eventsData] = await Promise.all([
        getMetrics(),
        getEvents({ 
          page: currentPage, 
          per_page: 10, 
          mode: modeFilter || undefined,
          date_from: startDate <= endDate ? startDate : endDate,
          date_to: startDate <= endDate ? endDate : startDate,
          impact_min: impactThreshold > 0 ? impactThreshold : undefined
        }),
      ])
      setMetrics(metricsData.metrics)
      setRows(eventsData.data)
      setPagination(eventsData.pagination)
    } catch (err) {
      console.error('Failed to fetch activity data:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, modeFilter, startDate, endDate, impactThreshold])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
    window.addEventListener('activity-logged', fetchData)
    return () => window.removeEventListener('activity-logged', fetchData)
  }, [fetchData])

  const totalPages = pagination.total_pages
  const pageNumbers = useMemo(() => {
    const nums = []
    for (let i = 1; i <= Math.min(totalPages, 5); i++) nums.push(i)
    return nums
  }, [totalPages])

  const getSelectedText = () => {
    if (!modeFilter) return "All Activities";
    for (const cat of CATEGORY_MODES) {
      const opt = cat.options.find(o => o.val === modeFilter);
      if (opt) return opt.text;
    }
    return modeFilter;
  };

  const handleExportCSV = () => {
    if (rows.length === 0) return showAlert('Export Failed', 'No data to export.')
    const headers = ['Timestamp', 'Mode', 'Origin', 'Destination', 'Distance', 'Duration', 'Impact_kgCO2e']
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.timestamp}"`, `"${r.mode}"`, `"${r.origin}"`, `"${r.destination}"`, `"${r.distance}"`, `"${r.duration}"`, r.impact
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'carbon_activities.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchesSearch = r.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.destination.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesImpact = parseFloat(r.impact) >= impactThreshold
      return matchesSearch && matchesImpact
    })
  }, [rows, searchQuery, impactThreshold])

  return (
    <Layout>
      <div className="activity-ledger-root flex-1 flex flex-col bg-background text-on-background font-sans antialiased overflow-hidden">
        {/* ── TopAppBar ── */}
        <header className="sticky top-0 w-full z-40 bg-surface border-b border-surface-container-highest flex items-center justify-between h-14 px-container-padding">
        <div className="flex items-center bg-surface-container-low border border-surface-container-highest rounded px-stack-sm py-1 max-w-md w-full focus-within:ring-1 focus-within:ring-primary transition-all">
          <span className="material-symbols-outlined text-on-surface-variant mr-stack-sm">search</span>
          <input
            className="bg-transparent border-none text-body-sm text-on-surface w-full focus:outline-none focus:ring-0 placeholder-on-surface-variant"
            placeholder="Search resources..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => window.dispatchEvent(new Event('toggle-chat'))} className="text-primary bg-primary/10 hover:bg-primary/20 transition-colors h-8 w-8 flex items-center justify-center rounded-full focus:ring-1 focus:ring-primary">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </button>
          <button onClick={() => showAlert("Notifications", "No new notifications at this time.")} className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </button>
        </div>
      </header>

        {/* ── Main Content Canvas ── */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-container-padding flex flex-col gap-gutter">
        {/* Header Actions */}
        <div className="flex items-end justify-between mb-stack-sm">
          <div>
            <h2 className="text-headline-md text-on-surface mb-1">Activity Log</h2>
            <p className="text-body-sm text-on-surface-variant">Track your daily activities and their carbon impact.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportCSV} className="bg-transparent border border-surface-container-highest text-on-surface text-body-sm px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
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
          <div className="flex items-center gap-2 bg-background border border-surface-container-highest rounded px-3 py-1.5 focus-within:border-primary">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">calendar_today</span>
            <input 
              type="date" 
              className="bg-transparent text-data-sm font-mono text-on-surface focus:outline-none border-none outline-none appearance-none" 
              value={startDate} 
              max={todayStr}
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="text-on-surface-variant text-data-sm">-</span>
            <input 
              type="date" 
              className="bg-transparent text-data-sm font-mono text-on-surface focus:outline-none border-none outline-none appearance-none" 
              value={endDate} 
              max={todayStr}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          {/* Mode Filter (Custom Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-background border border-surface-container-highest rounded px-3 py-1.5 text-data-sm font-mono text-on-surface cursor-pointer hover:border-outline transition-colors flex items-center justify-between min-w-[160px]"
            >
              <span>{getSelectedText()}</span>
              <span className="material-symbols-outlined text-[16px] ml-2">expand_more</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-surface-container-high border border-surface-container-highest rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                <button 
                  className={`w-full text-left px-4 py-2 text-data-sm font-mono hover:bg-surface-container-highest transition-colors ${modeFilter === '' ? 'text-primary' : 'text-on-surface'}`}
                  onClick={() => { setModeFilter(''); setCurrentPage(1); setIsDropdownOpen(false); }}
                >
                  All Activities
                </button>
                {CATEGORY_MODES.map((cat) => (
                  <div key={cat.label}>
                    <div className="px-4 py-1.5 bg-surface-container/50 text-label-caps text-on-surface-variant uppercase mt-1">
                      {cat.label}
                    </div>
                    {cat.options.map(opt => (
                      <button
                        key={opt.val}
                        className={`w-full text-left px-4 py-2 text-data-sm font-mono hover:bg-surface-container-highest transition-colors ${modeFilter === opt.val ? 'text-primary bg-surface-container' : 'text-on-surface'}`}
                        onClick={() => { setModeFilter(opt.val); setCurrentPage(1); setIsDropdownOpen(false); }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Impact Threshold */}
          <div className="flex items-center gap-3 ml-auto text-data-sm font-mono text-on-surface-variant">
            <span>Impact &gt;</span>
            <div className="relative">
              <input
                className="w-20 bg-background border border-surface-container-highest rounded px-2 py-1 text-center focus:outline-none focus:border-primary text-on-surface"
                type="number"
                min="0"
                step="0.1"
                value={impactThreshold}
                onChange={(e) => setImpactThreshold(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-data-sm pointer-events-none text-on-surface-variant">kg</span>
            </div>
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
                {filteredRows.map((row, i) => (
                  <React.Fragment key={row.id || i}>
                    <tr 
                      className={`border-b border-surface-container-highest hover:bg-surface-container-low transition-colors group cursor-pointer ${expandedRowId === row.id ? 'bg-surface-container-low' : ''}`}
                      onClick={() => setExpandedRowId(expandedRowId === row.id ? null : row.id)}
                    >
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
                        {row.origin !== 'N/A' && row.destination !== 'N/A' ? (
                          <div className="w-16 h-8 bg-surface-container-highest rounded border border-surface-container-highest overflow-hidden relative flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors">
                            <span className="material-symbols-outlined text-[16px]">map</span>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant opacity-50">-</span>
                        )}
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
                    {expandedRowId === row.id && row.origin !== 'N/A' && row.destination !== 'N/A' && (
                      <tr className="bg-surface-container-lowest border-b border-surface-container-highest">
                        <td colSpan="7" className="p-4">
                          <div className="w-full h-64 rounded-xl overflow-hidden border border-surface-container-highest relative">
                            <iframe
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://maps.google.com/maps?saddr=${encodeURIComponent(row.origin)}&daddr=${encodeURIComponent(row.destination)}&output=embed`}
                            ></iframe>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setExpandedRowId(null); }}
                              className="absolute top-2 right-2 bg-surface border border-surface-container-highest text-on-surface w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors shadow-md"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
    </Layout>
  )
}
