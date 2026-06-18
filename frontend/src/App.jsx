import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ActivityLedger from './pages/ActivityLedger.jsx'
import Wallet from './pages/Wallet.jsx'
import Login from './pages/Login.jsx'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityLedger /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
