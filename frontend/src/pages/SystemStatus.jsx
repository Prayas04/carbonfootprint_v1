import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSystemStatus, updatePreferences } from '../api/system.js'
import './SystemStatus.css'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'history', label: 'Activity Logs', path: '/activity' },
  { icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet' },
  { icon: 'data_check', label: 'System Status', path: '/system', active: true },
]

export default function SystemStatus() {
  const { logout } = useAuth()
  const [toggles, setToggles] = useState({ background: true, aggressive: false, verbose: true })
  const [subsystems, setSubsystems] = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [logEntries, setLogEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const terminalRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSystemStatus()
        setSubsystems(data.subsystems)
        setEndpoints(data.endpoints)
        setLogEntries(data.logs)
      } catch (err) {
        console.error('Failed to fetch system status:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logEntries])

  const toggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleApplyPrefs = async () => {
    try {
      await updatePreferences({
        background_processing: toggles.background,
        aggressive_optimization: toggles.aggressive,
        verbose_debug: toggles.verbose,
      })
    } catch (err) {
      console.error('Failed to update preferences:', err)
    }
  }

  return (
    <div className="system-status-root bg-background text-on-background font-sans antialiased min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
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
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative bg-grid-pattern">
        {/* TopAppBar */}
        <header className="flex items-center justify-between h-14 pr-container-padding pl-container-padding w-full z-40 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest sticky top-0">
          <div className="flex items-center gap-2">
            <h2 className="text-headline-sm font-semibold text-primary">System Health &amp; API Monitor</h2>
            <div className="h-4 w-[1px] bg-surface-container-highest mx-2 hidden sm:block"></div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-secondary-container/10 text-secondary border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              ALL SYSTEMS OPERATIONAL
            </span>
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

        {/* Page Content */}
        <div className="p-container-padding flex flex-col gap-stack-lg max-w-[1600px] w-full mx-auto pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading system status...
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

            {/* ── Subsystem Status Cards (Span 8) ── */}
            <div className="lg:col-span-8 flex flex-col gap-stack-md">
              <div className="flex items-center justify-between">
                <h3 className="text-body-md font-medium text-on-surface">Core Subsystems</h3>
                <span className="text-label-caps text-on-surface-variant uppercase">Updated just now</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {subsystems.map((sys) => (
                  <div key={sys.name} className="bg-[#0f172a] rounded-lg border border-[#334155] p-5 flex flex-col relative overflow-hidden group hover:border-surface-variant transition-colors">
                    <div className={`absolute top-0 right-0 w-16 h-16 ${sys.accent_bg} rounded-bl-[100px] -z-0`}></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">{sys.icon}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono bg-${sys.status_color}/20 text-${sys.status_color} border border-${sys.status_color}/30`}>
                        {sys.status_label}
                      </span>
                    </div>
                    <h4 className="text-body-sm font-medium text-on-surface mb-1">{sys.name}</h4>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-headline-md font-mono text-primary">{sys.uptime}</span>
                      <span className="text-data-sm font-mono text-on-surface-variant pb-1">Uptime</span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1.5 uppercase">
                        <span>{sys.confidence_label}</span>
                        <span className={sys.confidence_color}>{sys.confidence_value}</span>
                      </div>
                      <div className="h-1 w-full bg-[#1e293b] rounded-full overflow-hidden">
                        <div className={`h-full ${sys.bar_color} rounded-full`} style={{ width: sys.bar_width }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Engine Preferences (Span 4) ── */}
            <div className="lg:col-span-4 flex flex-col gap-stack-md">
              <h3 className="text-body-md font-medium text-on-surface">Engine Preferences</h3>
              <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-5 h-full flex flex-col gap-4">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
                  <div>
                    <h4 className="text-body-sm font-medium text-on-surface">Background Processing</h4>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">Allow offline batch queuing.</p>
                  </div>
                  <div className={`toggle-track ${toggles.background ? 'active' : ''}`} onClick={() => toggle('background')}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
                {/* Toggle 2 */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
                  <div>
                    <h4 className="text-body-sm font-medium text-on-surface">Aggressive Optimization</h4>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">Trade fidelity for battery life.</p>
                  </div>
                  <div className={`toggle-track ${toggles.aggressive ? 'active' : ''}`} onClick={() => toggle('aggressive')}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
                {/* Toggle 3 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-body-sm font-medium text-on-surface">Verbose Debug Mode</h4>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">Stream granular CLI events.</p>
                  </div>
                  <div className={`toggle-track ${toggles.verbose ? 'active' : ''}`} onClick={() => toggle('verbose')}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <button className="flex-1 bg-transparent border border-[#334155] text-[#f1f5f9] text-[12px] font-medium py-2 rounded hover:bg-surface-container transition-colors">Reset Defaults</button>
                  <button onClick={handleApplyPrefs} className="flex-1 bg-primary-container text-[#020617] text-[12px] font-semibold py-2 rounded hover:brightness-110 transition-colors">Apply Changes</button>
                </div>
              </div>
            </div>

            {/* ── API Endpoint Monitor (Span 7) ── */}
            <div className="lg:col-span-7 flex flex-col gap-stack-md">
              <h3 className="text-body-md font-medium text-on-surface">API Endpoint Telemetry</h3>
              <div className="bg-[#0f172a] rounded-lg border border-[#334155] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest/50 border-b border-[#1e293b]">
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider font-normal">Endpoint</th>
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider font-normal">Status</th>
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider text-right font-normal">Latency</th>
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider text-right font-normal">Volume / min</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm font-mono text-on-surface divide-y divide-[#1e293b]">
                    {endpoints.map((ep, i) => (
                      <tr key={i} className={`hover:bg-[#1e293b]/50 transition-colors ${ep.highlight ? 'bg-tertiary-fixed-dim/5' : ''}`}>
                        <td className="py-3 px-4 text-primary font-medium">{ep.path}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-${ep.status_color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-${ep.status_color}`}></span>
                            {ep.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{ep.latency}</td>
                        <td className={`py-3 px-4 text-right ${ep.highlight ? 'text-tertiary-fixed-dim' : ''}`}>{ep.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Live Event Stream (Span 5) ── */}
            <div className="lg:col-span-5 flex flex-col gap-stack-md">
              <div className="flex items-center justify-between">
                <h3 className="text-body-md font-medium text-on-surface">Live Event Stream</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Streaming</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-lg border border-[#334155] p-1 h-[240px] flex flex-col relative shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {/* Terminal Header */}
                <div className="px-3 py-2 border-b border-[#1e293b] flex items-center justify-between bg-surface-container-low/50 rounded-t-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#334155]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#334155]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#334155]"></div>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant">carbon_engine_tty1</span>
                </div>
                {/* Terminal Body */}
                <div ref={terminalRef} className="flex-1 overflow-y-auto terminal-scroll p-3 text-[11px] font-mono leading-relaxed space-y-1">
                  {logEntries.map((entry, i) => (
                    <div key={i} className="text-on-surface-variant flex gap-3">
                      <span className="text-[#64748b] w-16 shrink-0">{entry.time}</span>
                      <span className={`${entry.level_color} w-10 shrink-0`}>{entry.level}</span>
                      <span>
                        {entry.msg}
                        {entry.cursor && <span className="inline-block w-1.5 h-3 bg-primary-container animate-pulse ml-1 align-middle"></span>}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none"></div>
              </div>
            </div>

          </div>
          )}
        </div>
      </main>
    </div>
  )
}
