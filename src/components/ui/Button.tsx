import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'paper'

const styles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-[#e8b04e] to-[#b5782a] text-[#2a1408] border border-[#f6d88f]/70 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.5)_inset] hover:from-[#f3c46a] hover:to-[#c68632] active:translate-y-px',
  ghost:
    'bg-black/25 text-cream border border-brass/50 hover:bg-black/40 hover:border-glow backdrop-blur-sm',
  paper:
    'bg-[#f1e3bd] text-umber border border-[#8b5a30]/60 hover:bg-[#f7ebc9] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]',
}

export function Button({
  variant = 'primary', className = '', children, ...rest
}: { variant?: Variant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-display text-lg font-semibold tracking-[0.12em] uppercase transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function IconButton({
  label, children, className = '', ...rest
}: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      {...rest}
      className={`grid h-11 w-11 place-items-center rounded-full border border-brass/40 bg-black/35 text-cream backdrop-blur-sm transition hover:border-glow hover:bg-black/55 hover:text-glow ${className}`}
    >
      {children}
    </button>
  )
}
