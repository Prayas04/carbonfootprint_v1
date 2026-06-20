import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import { DialogProvider } from '../context/DialogContext'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import * as dashboardApi from '../api/dashboard'

vi.mock('../api/dashboard', () => ({
  getDashboard: vi.fn()
}))

vi.mock('../api/auth', () => ({
  getMe: vi.fn().mockResolvedValue({ email: 'test@test.com' })
}))

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DialogProvider>
            {ui}
          </DialogProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    dashboardApi.getDashboard.mockReturnValue(new Promise(() => {})) // hangs
    renderWithProviders(<Dashboard />)
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument()
  })

  it('renders data when loaded', async () => {
    const mockData = {
      global_impact: { total_co2e_kg: 1234.5, trend_data: [] },
      daily_insight: { message: 'Great job!', icon: 'check', streak_days: 5, co2_saved_today: 10 },
      budget: { cycle_name: 'Monthly', total_kg: 500, used_kg: 100, remaining_kg: 400, percent_used: 20 },
      recent_events: []
    }
    dashboardApi.getDashboard.mockResolvedValue(mockData)
    
    renderWithProviders(<Dashboard />)
    
    expect(await screen.findByText('1,234.5')).toBeInTheDocument()
    expect(screen.getByText('Great job!')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
