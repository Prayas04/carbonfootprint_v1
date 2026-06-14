import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('demo@carbontrack.io')
  const [password, setPassword] = useState('password123')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await register(email, password, fullName)
      } else {
        await login(email, password)
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg-grid"></div>
      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <h1 className="login-brand-title">CarbonTrack</h1>
            <p className="login-brand-subtitle">ENTERPRISE CONSOLE</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          <h2 className="login-heading">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="login-subheading">
            {isRegister ? 'Sign up to start tracking your carbon footprint.' : 'Sign in to your dashboard.'}
          </p>

          {error && (
            <div className="login-error">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="login-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {isRegister ? 'person_add' : 'login'}
                  </span>
                  {isRegister ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            className="login-toggle"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>

          {!isRegister && (
            <p className="login-demo-hint">
              Demo: demo@carbontrack.io / password123
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
