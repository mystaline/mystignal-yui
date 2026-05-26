import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'cdFadeIn 0.12s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--line-strong)',
          borderRadius: '0.875rem',
          padding: '1.75rem 2rem',
          width: '100%',
          maxWidth: '25rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'cdSlideUp 0.15s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          fontFamily: 'var(--display)',
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          marginBottom: '0.625rem',
          color: 'var(--ink)',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.8125rem',
          color: 'var(--ink-2)',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
          <button
            className="btn"
            onClick={onCancel}
            style={{ color: 'var(--ink-3)' }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className="btn"
            onClick={onConfirm}
            style={danger ? {
              color: 'var(--down)',
              borderColor: 'rgba(239,68,68,.4)',
              background: 'rgba(239,68,68,.08)',
            } : {
              color: 'var(--accent)',
              borderColor: 'rgba(var(--accent-rgb),.4)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
