import { createContext, useContext, useMemo, useRef, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const api = useMemo(() => ({
    show(message, variant = 'success', duration = 3000) {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, message, variant }])
      if (duration > 0) {
        setTimeout(() => {
          setToasts((t) => t.filter((x) => x.id !== id))
        }, duration)
      }
      return id
    },
    dismiss(id) {
      setToasts((t) => t.filter((x) => x.id !== id))
    },
  }), [])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[1000] grid gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              `pointer-events-auto select-none rounded-lg border px-3 py-2 text-sm shadow ` +
              (t.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800')
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
