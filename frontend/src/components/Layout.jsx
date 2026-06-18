import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'history', label: 'Activity Log', path: '/activity' },
  { icon: 'lightbulb', label: 'Insights', path: '/insights' },
  { icon: 'emoji_events', label: 'Green Rewards', path: '/wallet' },
]

export default function Layout({ children }) {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="bg-background text-on-background font-sans antialiased min-h-screen flex flex-col md:flex-row overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* ── Desktop SideNavBar ── */}
      <nav className="hidden md:flex flex-col h-full py-stack-lg fixed left-0 top-0 w-[280px] bg-surface border-r border-surface-container-highest z-50">
        {/* Brand Header */}
        <div className="px-container-padding mb-stack-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <h1 className="text-headline-md font-bold text-primary tracking-tight">CarbonTrack</h1>
            <p className="text-label-caps text-on-surface-variant mt-1 uppercase">Personal Tracker</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.label}
                to={item.path}
                className={
                  isActive
                    ? 'flex items-center gap-3 px-3 py-2.5 rounded text-primary font-bold border-r-2 border-primary bg-surface-container opacity-80 scale-[0.99] transition-all'
                    : 'flex items-center gap-3 px-3 py-2.5 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant font-medium'
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-body-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="px-container-padding mt-stack-md mb-stack-lg">
          <button className="w-full bg-primary-container text-on-primary-container text-body-sm font-semibold py-2.5 rounded shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Log Activity
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
      {/* On desktop: shift right by sidebar width. On mobile: padding bottom for nav bar */}
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen pb-[72px] md:pb-0 relative">
        {children}
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[72px] bg-surface/90 backdrop-blur-md border-t border-surface-container-highest z-50 flex items-center justify-around px-2 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors ${
                isActive ? 'bg-secondary-container/20 text-secondary' : 'bg-transparent'
              }`}>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── Mobile FAB (Floating Action Button) ── */}
      <button className="md:hidden fixed right-4 bottom-[88px] w-14 h-14 bg-primary-container text-on-primary-container rounded-2xl shadow-lg flex items-center justify-center z-50 hover:brightness-110 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

    </div>
  )
}
