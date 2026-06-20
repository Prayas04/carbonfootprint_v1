import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-settings', handleOpen)
    return () => window.removeEventListener('open-settings', handleOpen)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface border border-surface-container-highest rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex max-h-[80vh] min-h-[400px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-surface-container-highest bg-surface-container-low/50 flex flex-col p-4">
          <h2 className="text-headline-sm text-on-surface font-semibold mb-6 px-2">Settings</h2>
          <nav className="flex flex-col gap-1 flex-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm transition-colors text-left ${activeTab === 'profile' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm transition-colors text-left ${activeTab === 'preferences' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">palette</span>
              Preferences
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-surface">
          <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center">
            <h3 className="text-body-lg text-on-surface font-medium capitalize">{activeTab}</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[32px]">account_circle</span>
                  </div>
                  <div>
                    <h4 className="text-body-lg text-on-surface font-medium">Demo User</h4>
                    <p className="text-body-sm text-on-surface-variant">demo@carbontrack.com</p>
                  </div>
                </div>
                <div className="border-t border-surface-container-highest pt-4 mt-2">
                  <p className="text-body-sm text-on-surface-variant mb-4">Account management details will be available soon.</p>
                </div>
              </div>
            )}
            {activeTab === 'preferences' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-body-md text-on-surface font-medium mb-4">Appearance</h4>
                  <div className="flex items-center justify-between bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4">
                    <div>
                      <div className="text-body-sm text-on-surface font-medium">Theme</div>
                      <div className="text-data-sm text-on-surface-variant mt-1">Switch between Light and Dark mode.</div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="relative w-12 h-6 rounded-full bg-surface-container-highest transition-colors focus:outline-none ring-1 ring-inset ring-outline-variant"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-transform ${isDarkMode ? 'translate-x-6 bg-primary' : 'translate-x-0 bg-surface'}`}
                      >
                        <span className={`material-symbols-outlined text-[14px] ${isDarkMode ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                          {isDarkMode ? 'dark_mode' : 'light_mode'}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
