import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn()
}))

function TestComponent() {
  const { user, login, logout, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial state without user', async () => {
    authApi.getMe.mockRejectedValue(new Error('Unauthorized'))
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(await screen.findByText('No user')).toBeInTheDocument()
  })

  it('fetches user on mount if token exists', async () => {
    localStorage.setItem('carbontrack_access_token', 'fake-token')
    authApi.getMe.mockResolvedValue({ id: 1, email: 'test@test.com' })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(await screen.findByText('test@test.com')).toBeInTheDocument()
  })
})
