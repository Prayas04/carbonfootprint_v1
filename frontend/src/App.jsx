import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ActivityLedger = lazy(() => import('./pages/ActivityLedger.jsx'))
const Insights = lazy(() => import('./pages/Insights.jsx'))
const Wallet = lazy(() => import('./pages/Wallet.jsx'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#020617', color: '#6ffbbe',
        fontFamily: 'system-ui', fontSize: '14px', gap: '12px'
      }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
        Loading...
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#020617', color: '#6ffbbe',
      fontFamily: 'system-ui', fontSize: '14px', gap: '12px'
    }}>
      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
      Loading...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityLedger /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
