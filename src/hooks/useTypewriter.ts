import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Seconds of silence after a character — the small pauses that give a line its weight. */
function pauseAfter(ch: string, next: string | undefined) {
  if (ch === '…') return 0.42
  if (ch === '—') return 0.26
  if (ch === '.' && next === ' ') return 0.2
  if ((ch === '?' || ch === '!') && next === ' ') return 0.22
  if (ch === ',' && next === ' ') return 0.08
  return 0
}

/**
 * Reveals text progressively; `skip()` completes it. Honors reduced-motion.
 * `lead` is a breath of silence before the first word (used for inner thoughts and heavy moments).
 */
export function useTypewriter(text: string, cps = 70, lead = 0) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(reduce ? text.length : 0)
  const raf = useRef(0)

  // the moment (seconds) at which each character appears
  const times = useMemo(() => {
    const out: number[] = []
    let t = lead
    for (let i = 0; i < text.length; i++) {
      out.push(t)
      t += 1 / cps + pauseAfter(text[i], text[i + 1])
    }
    return out
  }, [text, cps, lead])

  useEffect(() => {
    if (reduce) { setN(text.length); return }
    setN(0)
    const start = performance.now()
    const tick = (now: number) => {
      const el = (now - start) / 1000
      let c = 0
      while (c < times.length && times[c] <= el) c++
      setN(c)
      if (c < text.length) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [text, times, reduce])

  const skip = useCallback(() => { cancelAnimationFrame(raf.current); setN(text.length) }, [text])
  return { shown: text.slice(0, n), done: n >= text.length, skip }
}
