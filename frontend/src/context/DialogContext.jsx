import React, { createContext, useContext, useState } from 'react'

const DialogContext = createContext()

export function useDialog() {
  return useContext(DialogContext)
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const closeDialog = () => setDialog(null)

  const showAlert = (title, message) => {
    setDialog({ type: 'alert', title, message, onConfirm: closeDialog })
  }

  const showConfirm = (title, message, onConfirm) => {
    setDialog({ 
      type: 'confirm', 
      title, 
      message, 
      onConfirm: () => { onConfirm(); closeDialog(); },
      onCancel: closeDialog
    })
  }

  const showPrompt = (title, message, defaultValue, onConfirm) => {
    setDialog({ 
      type: 'prompt', 
      title, 
      message, 
      defaultValue,
      onConfirm: (val) => { onConfirm(val); closeDialog(); },
      onCancel: closeDialog
    })
  }

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {dialog && <DialogModal {...dialog} onClose={closeDialog} />}
    </DialogContext.Provider>
  )
}

function DialogModal({ type, title, message, defaultValue, onConfirm, onCancel, onClose }) {
  const [inputValue, setInputValue] = useState(defaultValue || '')

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (type === 'prompt') {
      onConfirm(inputValue)
    } else {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-dim/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-surface-container-highest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center bg-surface-container/30">
          <h2 className="text-headline-sm text-on-surface font-semibold flex items-center gap-2">
            {type === 'alert' && <span className="material-symbols-outlined text-primary">info</span>}
            {type === 'confirm' && <span className="material-symbols-outlined text-secondary">help</span>}
            {type === 'prompt' && <span className="material-symbols-outlined text-tertiary">edit</span>}
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-body-md text-on-surface-variant mb-4">{message}</p>
          {type === 'prompt' && (
            <form id="dialog-form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-4 py-2.5 text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                autoFocus
              />
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-container-highest bg-surface-container/30 flex justify-end gap-3">
          {(type === 'confirm' || type === 'prompt') && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            type={type === 'prompt' ? "submit" : "button"}
            form={type === 'prompt' ? "dialog-form" : undefined}
            onClick={type !== 'prompt' ? handleSubmit : undefined}
            className={`px-6 py-2 rounded-lg text-on-primary-container text-body-sm font-bold shadow transition-all ${
              type === 'alert' ? 'bg-primary hover:bg-primary-fixed' : 
              type === 'confirm' ? 'bg-secondary hover:brightness-110' : 
              'bg-tertiary-container hover:brightness-110'
            }`}
          >
            {type === 'alert' ? 'OK' : type === 'confirm' ? 'Confirm' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
