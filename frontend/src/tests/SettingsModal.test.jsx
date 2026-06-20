import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SettingsModal from '../components/SettingsModal'
import { ThemeProvider } from '../context/ThemeContext'

describe('SettingsModal', () => {
  it('does not render initially', () => {
    render(
      <ThemeProvider>
        <SettingsModal />
      </ThemeProvider>
    )
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('renders when open-settings event is dispatched', () => {
    render(
      <ThemeProvider>
        <SettingsModal />
      </ThemeProvider>
    )
    
    act(() => {
      window.dispatchEvent(new Event('open-settings'))
    })
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Demo User')).toBeInTheDocument()
  })

  it('can switch tabs', () => {
    render(
      <ThemeProvider>
        <SettingsModal />
      </ThemeProvider>
    )
    
    act(() => {
      window.dispatchEvent(new Event('open-settings'))
    })
    
    const prefTab = screen.getByText('Preferences')
    fireEvent.click(prefTab)
    
    expect(screen.getByText('Appearance')).toBeInTheDocument()
  })
})
