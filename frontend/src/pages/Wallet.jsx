import { useState, useEffect } from 'react'
import { getWallet, getTransactions, getGreenNodes } from '../api/wallet.js'
import Layout from '../components/Layout.jsx'
import './Wallet.css'

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance_tco2e: 0, nfc_status: 'Inactive', card_id_last4: '0000' })
  const [transactions, setTransactions] = useState([])
  const [greenNodes, setGreenNodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [w, tx, nodes] = await Promise.all([
          getWallet(),
          getTransactions(),
          getGreenNodes(),
        ])
        setWallet(w)
        setTransactions(tx.data)
        setGreenNodes(nodes)
      } catch (err) {
        console.error('Failed to fetch wallet data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    window.addEventListener('activity-logged', fetchData)
    return () => window.removeEventListener('activity-logged', fetchData)
  }, [])

  return (
    <Layout>
      {/* ── Main Content Wrapper ── */}
      <div className="wallet-root flex-1 flex flex-col overflow-hidden relative z-10">
        {/* TopAppBar */}
        <header className="flex items-center justify-between h-14 px-container-padding w-full z-40 bg-surface border-b border-surface-container-highest shrink-0">
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

        {/* Scrollable Content Canvas */}
        <main className="flex-1 overflow-y-auto p-container-padding pb-32">
          {/* Page Header */}
          <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
            <div>
              <h1 className="text-display-lg text-on-surface mb-stack-sm">Green Rewards</h1>
              <p className="text-body-md text-on-surface-variant">Earn points for eco-friendly choices and track your green achievements.</p>
            </div>
            <div className="flex items-center gap-stack-sm">
              <button className="bg-transparent border border-surface-container-highest text-on-surface text-body-sm py-2 px-4 rounded hover:bg-surface-container-low transition-colors">View History</button>
              <button className="bg-primary-container text-[#020617] text-body-sm font-bold py-2 px-4 rounded hover:bg-primary-fixed transition-colors">Log Activity</button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading wallet data...
            </div>
          ) : (
          /* Bento Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

            {/* ── Virtual Carbon Card (4 cols) ── */}
            <div className="col-span-1 md:col-span-4 bg-surface-container-low rounded-xl border border-surface-container-highest p-stack-md relative overflow-hidden flex flex-col justify-between min-h-[240px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#bef264]/10 to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="text-on-surface-variant text-label-caps">EcoPoints Balance</div>
                <span className="material-symbols-outlined text-primary">emoji_events</span>
              </div>
              <div className="relative z-10 mt-stack-lg">
                <div className="text-display-lg text-primary leading-none">{wallet.balance_tco2e.toLocaleString()}</div>
                <div className="text-body-sm font-mono text-on-surface-variant mt-1">points earned</div>
              </div>
              <div className="flex justify-between items-end relative z-10 mt-stack-md pt-stack-md border-t border-surface-container-highest">
                <div>
                  <div className="text-label-caps text-on-surface-variant">Level</div>
                  <div className="text-body-sm text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Eco Warrior
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-label-caps text-on-surface-variant">Next Level</div>
                  <div className="text-data-sm font-mono text-on-surface">1,500 pts</div>
                </div>
              </div>
            </div>

            {/* ── Burn Rate Analytics (8 cols) ── */}
            <div className="col-span-1 md:col-span-8 bg-[#0f172a] rounded-xl border border-[#334155] p-stack-md flex flex-col">
              <div className="flex justify-between items-center mb-stack-md">
                <h2 className="text-headline-sm text-on-surface">Weekly Progress</h2>
                <select className="bg-surface border border-surface-container-highest text-body-sm text-on-surface rounded px-2 py-1 focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                  <option>YTD 2024</option>
                  <option>Q4 2023</option>
                  <option>Q3 2023</option>
                </select>
              </div>
              <div className="flex-1 relative min-h-[200px] border-b border-[#1e293b] border-l">
                {/* Chart Grid */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)', backgroundSize: '20% 25%', opacity: 0.5 }}></div>
                {/* Area Chart SVG */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="walletChartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#bef264" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#bef264" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,100 L0,60 C20,55 30,70 50,40 C70,10 80,30 100,20 L100,100 Z" fill="url(#walletChartGradient)" />
                  <path d="M0,60 C20,55 30,70 50,40 C70,10 80,30 100,20" fill="none" stroke="#bef264" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <path d="M0,50 L100,50" fill="none" stroke="#64748b" strokeDasharray="2 2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </svg>
                {/* X-axis Labels */}
                <div className="absolute bottom-[-15px] w-full flex justify-between text-label-caps text-on-surface-variant px-1">
                  <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                </div>
                {/* Y-axis Labels */}
                <div className="absolute left-[-20px] h-full flex flex-col justify-between text-label-caps text-on-surface-variant py-1 items-end pr-2">
                  <span>10k</span><span>5k</span><span>0</span>
                </div>
              </div>
            </div>

            {/* ── Transaction Ledger (8 cols) ── */}
            <div className="col-span-1 md:col-span-8 bg-[#0f172a] rounded-xl border border-[#334155] overflow-hidden flex flex-col">
              <div className="p-stack-md border-b border-[#1e293b] flex justify-between items-center bg-surface-container-lowest">
                  <h2 className="text-headline-sm text-on-surface">Rewards History</h2>
                <button className="text-body-sm text-primary hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e293b] bg-surface-container-lowest">
                      <th className="p-stack-sm text-label-caps text-on-surface-variant font-normal">Date</th>
                      <th className="p-stack-sm text-label-caps text-on-surface-variant font-normal">Description</th>
                      <th className="p-stack-sm text-label-caps text-on-surface-variant font-normal">Type</th>
                      <th className="p-stack-sm text-label-caps text-on-surface-variant font-normal text-right">Amount (tCO2e)</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm">
                    {transactions.map((tx, i) => (
                      <tr key={tx.id || i} className={`${i < transactions.length - 1 ? 'border-b border-[#1e293b]' : ''} hover:bg-[#1e293b] transition-colors group cursor-pointer`}>
                        <td className="p-stack-sm text-on-surface-variant font-mono text-data-sm">{tx.date}</td>
                        <td className="p-stack-sm text-on-surface">{tx.description}</td>
                        <td className="p-stack-sm">
                          <span className={`${tx.type_bg} px-2 py-1 rounded text-[10px] uppercase tracking-wider`}>{tx.type}</span>
                        </td>
                        <td className={`p-stack-sm text-right ${tx.amount_color} font-mono text-data-sm`}>{tx.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Geofenced Green Nodes (4 cols) ── */}
            <div className="col-span-1 md:col-span-4 bg-[#0f172a] rounded-xl border border-[#334155] p-stack-md flex flex-col">
              <div className="flex justify-between items-center mb-stack-md pb-stack-sm border-b border-[#1e293b]">
                <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">share_location</span>
                  Nearby Green Spots
                </h2>
              </div>

              {/* Google Maps Search Preview */}
              <div className="w-full h-48 rounded-lg overflow-hidden border border-surface-container-highest mb-4 flex-shrink-0">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=EV+charging+stations+OR+recycling+centers&output=embed`}
                ></iframe>
              </div>

              <div className="flex flex-col gap-stack-sm flex-1 overflow-y-auto">
                {greenNodes.map((node, i) => (
                  <div
                    key={node.id || i}
                    className={`bg-surface-container-lowest border border-surface-container-highest p-3 rounded flex justify-between items-center ${node.active ? 'hover:border-secondary transition-colors cursor-pointer' : 'opacity-70'}`}
                  >
                    <div>
                      <div className="text-body-md font-semibold text-on-surface">{node.name}</div>
                      <div className="text-label-caps text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> {node.distance}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-body-sm font-mono font-semibold ${node.rate_color}`}>{node.rate}</div>
                      <div className={`text-[10px] uppercase mt-1 ${node.status_color}`}>{node.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          )}
        </main>
      </div>
    </Layout>
  )
}
