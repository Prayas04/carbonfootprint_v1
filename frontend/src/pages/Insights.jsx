import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getInsights } from '../api/insights.js'
import './Insights.css'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'history', label: 'Activity Log', path: '/activity' },
  { icon: 'lightbulb', label: 'Insights', path: '/insights', active: true },
  { icon: 'emoji_events', label: 'Green Rewards', path: '/wallet' },
]

export default function Insights() {
  const { logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getInsights()
        setData(result)
      } catch (err) {
        console.error('Failed to fetch insights:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = data?.today_insight || { title: 'Loading...', description: '', icon: 'lightbulb', type: 'tip' }
  const challenges = data?.challenges || []
  const achievements = data?.achievements || []
  const equivalences = data?.equivalences || []

  return (
    <div className="insights-root bg-background text-on-background font-sans antialiased min-h-screen flex flex-col md:flex-row overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* ── SideNavBar ── */}
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
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen relative bg-grid-pattern">
        {/* TopAppBar */}
        <header className="flex items-center justify-between h-14 pr-container-padding pl-container-padding w-full z-40 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest sticky top-0">
          <div className="flex items-center gap-2">
            <h2 className="text-headline-sm font-semibold text-primary">Personalized Insights</h2>
            <div className="h-4 w-[1px] bg-surface-container-highest mx-2 hidden sm:block"></div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-secondary-container/10 text-secondary border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              UPDATED TODAY
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
        <main className="flex-1 p-container-padding overflow-y-auto pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Generating your personalized insights...
            </div>
          ) : (
          <div className="flex flex-col gap-stack-lg">

            {/* ── Today's Insight — Hero Card ── */}
            <div className="bg-[#0f172a] rounded-xl border border-[#334155] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-bl-[200px] insight-hero-glow"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-container/5 rounded-tr-[100px]"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>{today.icon}</span>
                  </div>
                  <div>
                    <span className="text-label-caps text-on-surface-variant uppercase">Today's Insight</span>
                    <h3 className="text-headline-md text-on-surface font-semibold">{today.title}</h3>
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed max-w-2xl">{today.description}</p>
                {today.impact_kg > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-data-sm font-mono">
                    <span className="material-symbols-outlined text-[16px]">eco</span>
                    Potential impact: {today.impact_kg} kg CO₂
                  </div>
                )}
              </div>
            </div>

            {/* ── Two-Column: Challenges + Achievements ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">

              {/* Weekly Challenges */}
              <div className="flex flex-col gap-stack-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-sm text-on-surface font-medium">Weekly Challenges</h3>
                  <span className="text-label-caps text-on-surface-variant uppercase">Complete to earn points</span>
                </div>
                <div className="flex flex-col gap-3">
                  {challenges.map((challenge, i) => (
                    <div key={i} className="challenge-card bg-[#0f172a] rounded-lg border border-[#334155] p-5 flex items-start gap-4 cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
                        <span className="material-symbols-outlined text-[20px]">{challenge.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-body-sm font-medium text-on-surface mb-1">{challenge.title}</h4>
                        <p className="text-[12px] text-on-surface-variant leading-relaxed">{challenge.description}</p>
                      </div>
                      {challenge.impact_kg && (
                        <div className="text-data-sm font-mono text-secondary shrink-0">
                          -{challenge.impact_kg} kg
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="flex flex-col gap-stack-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-sm text-on-surface font-medium">Your Achievements</h3>
                  <span className="text-label-caps text-on-surface-variant uppercase">{achievements.length} unlocked</span>
                </div>
                <div className="flex flex-col gap-3">
                  {achievements.map((achievement, i) => (
                    <div key={i} className="achievement-badge bg-[#0f172a] rounded-lg border border-[#334155] p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-body-sm font-medium text-on-surface mb-1">{achievement.title}</h4>
                        <p className="text-[12px] text-on-surface-variant leading-relaxed">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Impact Equivalences ── */}
            {equivalences.length > 0 && (
              <div className="flex flex-col gap-stack-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-sm text-on-surface font-medium">What Your Footprint Equals</h3>
                  <span className="text-label-caps text-on-surface-variant uppercase">Putting it in perspective</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {equivalences.map((eq, i) => (
                    <div key={i} className="equivalence-card bg-[#0f172a] rounded-lg border border-[#334155] p-5 flex flex-col text-center">
                      <div className="w-12 h-12 mx-auto rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface mb-3">
                        <span className="material-symbols-outlined text-[24px]">{eq.icon}</span>
                      </div>
                      <h4 className="text-headline-sm text-primary-container font-mono mb-1">{eq.title}</h4>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed">{eq.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          )}
        </main>
      </div>
    </div>
  )
}
