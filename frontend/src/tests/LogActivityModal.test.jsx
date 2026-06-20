import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LogActivityModal from '../components/LogActivityModal'
import * as activityApi from '../api/activity'

vi.mock('../api/activity', () => ({
  createEvent: vi.fn()
}))

describe('LogActivityModal', () => {
  it('renders nothing when not open', () => {
    render(<LogActivityModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />)
    expect(screen.queryByText('Log Activity')).not.toBeInTheDocument()
  })

  it('renders modal when open', () => {
    render(<LogActivityModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />)
    expect(screen.getByText('Log Activity')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    const { container } = render(<LogActivityModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />)
    
    const form = container.querySelector('#activity-form')
    fireEvent.submit(form)
    
    expect(await screen.findByText('Amount/Distance is required.')).toBeInTheDocument()
  })
})
