import { useState, useEffect } from 'react'
import { getInsights } from '../api/insights.js'
import { useDialog } from '../context/DialogContext.jsx'
import Layout from '../components/Layout.jsx'
import './Insights.css'

export default function Insights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [localChallenges, setLocalChallenges] = useState([])
  const { showAlert, showConfirm } = useDialog()

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getInsights()
        setData(result)
        if (result.challenges) {
          setLocalChallenges(result.challenges.map(c => ({...c, status: 'unstarted'})))
        }
      } catch (err) {
        console.error('Failed to fetch insights:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = data?.today_insight || { title: 'Loading...', description: '', icon: 'lightbulb', type: 'tip' }
  const challenges = localChallenges
  const achievements = data?.achievements || []
  const equivalences = data?.equivalences || []

  const handleChallengeClick = (index) => {
    const challenge = localChallenges[index];
    if (challenge.status === 'unstarted') {
      showConfirm("Start Challenge", `Do you want to start the challenge: "${challenge.title}"?`, () => {
        const newChallenges = [...localChallenges];
        newChallenges[index].status = 'in_progress';
        setLocalChallenges(newChallenges);
      })
    } else if (challenge.status === 'in_progress') {
      showConfirm("Complete Challenge", `Mark challenge "${challenge.title}" as completed?`, () => {
        const newChallenges = [...localChallenges];
        newChallenges[index].status = 'completed';
        setLocalChallenges(newChallenges);
      })
    }
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col w-full h-full insights-root bg-grid-pattern relative">
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
            <button onClick={() => showAlert("Notifications", "No new notifications at this time.")} className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-1 focus:ring-primary">
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
                    <div key={i} onClick={() => handleChallengeClick(i)} className={`challenge-card bg-[#0f172a] rounded-lg border border-[#334155] p-5 flex items-start gap-4 cursor-pointer hover:bg-[#1e293b] transition-colors ${challenge.status === 'completed' ? 'opacity-50' : ''}`}>
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {challenge.status === 'completed' ? 'check_circle' : challenge.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-body-sm font-medium text-on-surface mb-1">
                          {challenge.title}
                          {challenge.status === 'in_progress' && <span className="ml-2 text-[10px] font-mono bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">IN PROGRESS</span>}
                          {challenge.status === 'completed' && <span className="ml-2 text-[10px] font-mono bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded">DONE</span>}
                        </h4>
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
    </Layout>
  )
}
