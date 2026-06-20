import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/dashboard.js'
import { useDialog } from '../context/DialogContext.jsx'
import Layout from '../components/Layout.jsx'
import './Dashboard.css'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [localGoal, setLocalGoal] = useState(null)
  const { showAlert, showPrompt } = useDialog()

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
    window.addEventListener('activity-logged', fetchData)
    return () => window.removeEventListener('activity-logged', fetchData)
  }, [])

  const globalImpact = data?.global_impact || { total_co2e_kg: 0, trend_data: [] }
  const dailyInsight = data?.daily_insight || { message: 'Start logging activities to get personalized insights!', icon: 'lightbulb', streak_days: 0, co2_saved_today: 0 }
  const budget = data?.budget || { cycle_name: '—', total_kg: 0, used_kg: 0, remaining_kg: 0, percent_used: 0 }
  
  const displayBudget = { ...budget }
  if (localGoal !== null) {
    displayBudget.total_kg = localGoal
    displayBudget.remaining_kg = Math.max(0, localGoal - displayBudget.used_kg)
    displayBudget.percent_used = localGoal > 0 ? Math.min(100, Math.round((displayBudget.used_kg / localGoal) * 100)) : 0
  }

  const rawEvents = data?.recent_events || []
  const recentEvents = rawEvents.filter(e => 
    e.mode.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.distance.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdjustGoal = () => {
    showPrompt("Adjust Goal", "Enter your new monthly carbon goal in kg CO2e:", displayBudget.total_kg, (newGoal) => {
      if (newGoal !== null && !isNaN(newGoal) && newGoal.toString().trim() !== '') {
        setLocalGoal(parseFloat(newGoal))
      }
    })
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col w-full h-full dashboard-root">
        {/* TopAppBar */}
        <header className="flex items-center justify-between h-14 px-container-padding w-full z-40 bg-surface border-b border-surface-container-highest sticky top-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-64 md:w-96 focus-within:ring-1 focus-within:ring-primary rounded-md transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="w-full bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-on-surface-variant border border-surface-container-highest rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-primary-container bg-transparent"
                placeholder="Search metrics..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => showAlert("Notifications", "No new notifications at this time.")} className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
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

            {/* ── Top Row: My Footprint & Daily Insight ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">

              {/* My Carbon Footprint */}
              <div className="xl:col-span-8 bento-card p-container-padding flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container/5 to-transparent pointer-events-none"></div>
                <div className="z-10">
                  <h2 className="text-label-caps text-on-surface-variant uppercase mb-2">My Carbon Footprint</h2>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-display-lg text-primary-container tracking-tighter">{globalImpact.total_co2e_kg.toLocaleString()}</span>
                    <span className="text-headline-sm text-on-surface-variant">kg CO₂</span>
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
                    <span>30-Day Trend</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              {/* Daily Insight & Streak */}
              <div className="xl:col-span-4 flex flex-col gap-gutter h-full">
                <div className="bento-card p-5 flex flex-col justify-between flex-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-bl-[80px]"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1", fontSize: '22px' }}>{dailyInsight.icon}</span>
                    <span className="text-label-caps text-on-surface-variant uppercase">Today's Insight</span>
                  </div>
                  <p className="text-body-sm text-on-surface leading-relaxed flex-1">{dailyInsight.message}</p>
                  {dailyInsight.co2_saved_today > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      <span className="text-data-sm font-mono">{dailyInsight.co2_saved_today} kg CO₂ saved today</span>
                    </div>
                  )}
                </div>
                <div className="bento-card p-5 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>local_fire_department</span>
                    <span className="text-display-lg text-primary-container tracking-tighter">{dailyInsight.streak_days}</span>
                  </div>
                  <span className="text-label-caps text-on-surface-variant uppercase">Day Green Streak 🌱</span>
                </div>
              </div>
            </div>

            {/* ── Middle Row: Active Budget & Activity ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">

              {/* Monthly Carbon Goal */}
              <div className="xl:col-span-4 bento-card p-container-padding flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-label-caps text-on-surface-variant uppercase">Monthly Carbon Goal</h2>
                  <span className="text-label-caps bg-surface-container-high px-2 py-1 rounded text-on-surface">{budget.cycle_name}</span>
                </div>
                <div className="mb-4 flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-headline-md text-on-surface">
                      {displayBudget.used_kg.toLocaleString()}<span className="text-body-sm text-on-surface-variant ml-1">kg used</span>
                    </span>
                    <span className="text-body-md text-on-surface-variant">/ {displayBudget.total_kg.toLocaleString()} kg goal</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-secondary-container rounded-full progress-bar-fill" style={{ width: `${displayBudget.percent_used}%` }}></div>
                  </div>
                  <div className="flex justify-between text-data-sm font-mono text-on-surface-variant">
                    <span>{displayBudget.percent_used}% of goal</span>
                    <span>{displayBudget.remaining_kg.toLocaleString()} kg left</span>
                  </div>
                </div>
                <button onClick={handleAdjustGoal} className="w-full mt-auto py-2 border border-surface-container-highest rounded text-body-sm text-on-surface hover:bg-surface-container-high transition-colors">
                  Adjust My Goal
                </button>
              </div>

              {/* Recent Activity Feed */}
              <div className="xl:col-span-8 bento-card overflow-hidden flex flex-col">
                <div className="p-container-padding border-b border-surface-container-highest flex justify-between items-center bg-surface-container/50">
                  <h2 className="text-label-caps text-on-surface-variant uppercase">Recent Activities</h2>
                  <Link to="/activity" className="text-body-sm text-primary hover:text-primary-fixed transition-colors">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-container-highest bg-surface-container/30">
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase">Activity</th>
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase">Distance</th>
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase">Duration</th>
                        <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase text-right">Carbon Impact</th>
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
    </Layout>
  )
}
