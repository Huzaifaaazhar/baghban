import { useCallback, useEffect, useRef, useState } from 'react'

/** Reveals text progressively; `skip()` completes it. Honors reduced-motion. */
export function useTypewriter(text: string, cps = 70) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(reduce ? text.length : 0)
  const raf = useRef(0)

  useEffect(() => {
    if (reduce) { setN(text.length); return }
    setN(0)
    const start = performance.now()
    const tick = (t: number) => {
      const c = Math.min(text.length, Math.floor(((t - start) / 1000) * cps))
      setN(c)
      if (c < text.length) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [text, cps, reduce])

  const skip = useCallback(() => { cancelAnimationFrame(raf.current); setN(text.length) }, [text])
  return { shown: text.slice(0, n), done: n >= text.length, skip }
}
