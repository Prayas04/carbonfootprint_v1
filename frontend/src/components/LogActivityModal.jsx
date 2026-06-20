import { useState, useEffect } from 'react'
import { createEvent } from '../api/activity.js'

const CATEGORIES = {
  Transit: {
    icon: 'directions_car',
    unitName: 'Distance (km)',
    hasRoute: true,
    modes: {
      Walk: { icon: 'directions_walk', impactPerUnit: 0.0 },
      Bike: { icon: 'directions_bike', impactPerUnit: 0.0 },
      Transit: { icon: 'directions_bus', impactPerUnit: 0.05 },
      Train: { icon: 'directions_railway', impactPerUnit: 0.04 },
      Carpool: { icon: 'local_taxi', impactPerUnit: 0.10 },
      Car: { icon: 'directions_car', impactPerUnit: 0.20 },
      Flight: { icon: 'flight', impactPerUnit: 0.25 },
    }
  },
  Diet: {
    icon: 'restaurant',
    unitName: 'Meals',
    hasRoute: false,
    modes: {
      Vegan: { icon: 'eco', impactPerUnit: 1.5 },
      Vegetarian: { icon: 'grass', impactPerUnit: 2.0 },
      Pescatarian: { icon: 'set_meal', impactPerUnit: 3.0 },
      Meat: { icon: 'restaurant', impactPerUnit: 5.0 },
    }
  },
  Energy: {
    icon: 'bolt',
    unitName: 'Usage (kWh)',
    hasRoute: false,
    modes: {
      Electricity: { icon: 'bolt', impactPerUnit: 0.4 },
      Heating: { icon: 'local_fire_department', impactPerUnit: 0.2 },
    }
  },
  Shopping: {
    icon: 'shopping_bag',
    unitName: 'Items',
    hasRoute: false,
    modes: {
      Clothing: { icon: 'checkroom', impactPerUnit: 15.0 },
      Electronics: { icon: 'devices', impactPerUnit: 50.0 },
    }
  }
}

export default function LogActivityModal({ isOpen, onClose, onSuccess }) {
  const [category, setCategory] = useState('Transit')
  const [mode, setMode] = useState('Bike')
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [debouncedOrigin, setDebouncedOrigin] = useState('')
  const [debouncedDestination, setDebouncedDestination] = useState('')

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCategory('Transit')
      setMode('Bike')
      setAmount('')
      setDuration('')
      setOrigin('')
      setDestination('')
      setError('')
      setDebouncedOrigin('')
      setDebouncedDestination('')
    }
  }, [isOpen])

  // Debounce origin and destination to prevent excessive Map API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOrigin(origin)
      setDebouncedDestination(destination)
    }, 800)
    return () => clearTimeout(timer)
  }, [origin, destination])

  if (!isOpen) return null

  const activeCategory = CATEGORIES[category]
  const hasRoute = activeCategory.hasRoute

  const calculateImpact = () => {
    const val = parseFloat(amount) || 0
    return val * activeCategory.modes[mode].impactPerUnit
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount) {
      setError('Amount/Distance is required.')
      return
    }
    if (hasRoute && !duration) {
      setError('Duration is required for transit activities.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const payload = {
      timestamp: new Date().toISOString(),
      mode: mode,
      mode_icon: activeCategory.modes[mode].icon,
      origin: hasRoute ? (origin || 'Unknown') : 'N/A',
      destination: hasRoute ? (destination || 'Unknown') : 'N/A',
      distance_km: parseFloat(amount),
      duration_minutes: hasRoute ? parseInt(duration, 10) : 0,
      impact_kg_co2e: calculateImpact()
    }

    try {
      await createEvent(payload)
      onSuccess() // triggers reload
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log activity. Please try again.')
      setIsSubmitting(false)
    }
  }

  const impact = calculateImpact()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-dim/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-surface-container-highest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center bg-surface-container/30">
          <h2 className="text-headline-sm text-on-surface font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Log Activity
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded text-error text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form id="activity-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Category Selection */}
            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-2">Category</label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {Object.keys(CATEGORIES).map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setCategory(cat)
                      setMode(Object.keys(CATEGORIES[cat].modes)[0])
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      category === cat
                        ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                        : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-highest hover:border-outline hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{CATEGORIES[cat].icon}</span>
                    <span className="text-body-sm">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(activeCategory.modes).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
                      mode === m 
                        ? 'bg-primary-container/20 text-primary border-primary font-bold' 
                        : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-highest hover:border-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined mb-1" style={{ fontSize: '24px', fontVariationSettings: mode === m ? "'FILL' 1" : "'FILL' 0" }}>
                      {activeCategory.modes[m].icon}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid gap-4 ${hasRoute ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-2">{activeCategory.unitName}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-4 py-2.5 text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pl-9"
                    placeholder="e.g. 5"
                    required
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    {hasRoute ? 'route' : 'tag'}
                  </span>
                </div>
              </div>
              {hasRoute && (
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-2">Duration (min)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-4 py-2.5 text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pl-9"
                      placeholder="e.g. 30"
                      required={hasRoute}
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">timer</span>
                  </div>
                </div>
              )}
            </div>

            {hasRoute && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-2">Origin</label>
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-2">Destination</label>
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}

            {/* Google Maps Route Preview */}
            {hasRoute && debouncedOrigin.length > 2 && debouncedDestination.length > 2 && (
              <div className="w-full h-48 rounded-lg overflow-hidden border border-surface-container-highest bg-surface-container">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?saddr=${encodeURIComponent(debouncedOrigin)}&daddr=${encodeURIComponent(debouncedDestination)}&output=embed`}
                ></iframe>
              </div>
            )}

            {/* Impact Preview */}
            <div className="mt-2 bg-surface-container border border-surface-container-highest rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="text-label-caps text-on-surface-variant uppercase">Estimated Impact</div>
                <div className="text-body-sm text-on-surface opacity-70">Based on mode & quantity</div>
              </div>
              <div className={`text-headline-md font-mono ${impact === 0 ? 'text-secondary' : impact > 0.1 ? 'text-error' : 'text-tertiary-fixed-dim'}`}>
                {impact > 0 ? '+' : ''}{impact.toFixed(2)} <span className="text-body-sm">kg CO₂</span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-container-highest bg-surface-container/30 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="activity-form"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-primary text-on-primary-container text-body-sm font-bold shadow hover:bg-primary-fixed transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...</>
            ) : (
              'Save Activity'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
