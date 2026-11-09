import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { IconClose } from './Icons'

export function Modal({
  open, onClose, children, label, className = '', wide = false, bare = false, restoreFocus = true,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  label: string
  className?: string
  wide?: boolean
  bare?: boolean
  /** Return focus to the opener on close. Disabled in-game so Space/Enter keep advancing the story. */
  restoreFocus?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => { window.removeEventListener('keydown', onKey, true); if (restoreFocus) prev?.focus?.() }
  }, [open, onClose, restoreFocus])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-[#120904]/80 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex max-h-[92dvh] w-full flex-col outline-none ${wide ? 'max-w-5xl' : 'max-w-2xl'} ${bare ? '' : 'paper-dark rounded-md'} ${className}`}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-brass/40 bg-black/40 text-cream transition hover:border-glow hover:text-glow"
            >
              <IconClose width={18} height={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
