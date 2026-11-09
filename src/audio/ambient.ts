/**
 * Procedural soundscape for the Verma house — everything is synthesised in the browser (Web Audio);
 * nothing is sampled, nothing is copyrighted. Layers: a tanpura-like drone, a wall clock, a ceiling fan,
 * rain, a television in another room, a typewriter, household sounds and birdsong.
 * Audio only starts after a user gesture.
 */

export type Layer = 'tanpura' | 'clock' | 'fan' | 'rain' | 'tv' | 'typewriter' | 'household' | 'birds'

export const LAYERS: { id: Layer; label: string; hint: string }[] = [
  { id: 'tanpura', label: 'Tanpura drone', hint: 'A slow, plucked drone beneath everything' },
  { id: 'clock', label: 'Clock', hint: 'A wall clock, ticking' },
  { id: 'fan', label: 'Ceiling fan', hint: 'The old fan turning overhead' },
  { id: 'rain', label: 'Rain', hint: 'Monsoon on the terrace' },
  { id: 'tv', label: 'Television', hint: 'Voices from another room' },
  { id: 'typewriter', label: 'Typewriter', hint: 'Raj’s Remington' },
  { id: 'household', label: 'Household', hint: 'Cups, a pressure cooker, the flat breathing' },
  { id: 'birds', label: 'Birds & evening', hint: 'Sparrows in the neem' },
]
/** Relative loudness of each layer in the mix. */
const LEVEL: Record<Layer, number> = { tanpura: 1, clock: 0.55, fan: 0.5, rain: 0.8, tv: 0.35, typewriter: 0.9, household: 0.6, birds: 0.5 }

class Ambient {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bus = {} as Record<Layer, GainNode>
  private reverb: ConvolverNode | null = null
  private noiseBuf: AudioBuffer | null = null
  private timer: number | null = null
  private volume = 0.5
  private running = false
  private wanted = new Set<Layer>()
  private next: Record<string, number> = {}
  private step = 0
  private tvNodes: { gain: GainNode; formants: BiquadFilterNode[] } | null = null
  private started: Partial<Record<Layer, boolean>> = {}

  get isRunning() { return this.running }
  get active(): Layer[] { return [...this.wanted] }
  get state(): string { return this.ctx?.state ?? 'none' }
  /** For tests and diagnostics: target gain currently applied to each layer. */
  levels(): Partial<Record<Layer, number>> {
    const out: Partial<Record<Layer, number>> = {}
    for (const l of Object.keys(this.bus) as Layer[]) out[l] = Math.round(this.bus[l].gain.value * 1000) / 1000
    return out
  }

  private ensure() {
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    const ctx = new Ctor()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)
    for (const { id } of LAYERS) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(this.master); this.bus[id] = g
    }
    // synthetic reverb for the drone
    const len = Math.floor(ctx.sampleRate * 3.2)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) }
    this.reverb = ctx.createConvolver(); this.reverb.buffer = ir
    const wet = ctx.createGain(); wet.gain.value = 0.55
    this.reverb.connect(wet).connect(this.bus.tanpura)
    // one shared looping noise buffer (pink-ish)
    const n = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const d = n.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2 }
    this.noiseBuf = n
    return ctx
  }

  private noise(): AudioBufferSourceNode {
    const s = this.ctx!.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; s.loopStart = Math.random() * 2; return s
  }

  /* ----- continuous layers ----- */
  private startFan() {
    const ctx = this.ctx!, out = this.bus.fan
    const n = this.noise(), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 260; bp.Q.value = 0.9
    const am = ctx.createGain(); am.gain.value = 0.5
    const lfo = ctx.createOscillator(); lfo.frequency.value = 3.3; const lg = ctx.createGain(); lg.gain.value = 0.22; lfo.connect(lg).connect(am.gain)
    const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 57; const hg = ctx.createGain(); hg.gain.value = 0.05
    n.connect(bp).connect(am).connect(out); hum.connect(hg).connect(out)
    n.start(); lfo.start(); hum.start()
  }
  private startRain() {
    const ctx = this.ctx!, out = this.bus.rain
    const n = this.noise(), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 700
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000
    const g = ctx.createGain(); g.gain.value = 0.55
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12; const lg = ctx.createGain(); lg.gain.value = 0.12; lfo.connect(lg).connect(g.gain)
    n.connect(hp).connect(lp).connect(g).connect(out); n.start(); lfo.start()
  }
  private startTv() {
    const ctx = this.ctx!, out = this.bus.tv
    const n = this.noise(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700
    const formants = [520, 1450, 2400].map((f) => { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = 5; return b })
    const gain = ctx.createGain(); gain.gain.value = 0.0
    const sum = ctx.createGain(); sum.gain.value = 0.9
    for (const f of formants) n.connect(f).connect(sum)
    sum.connect(gain).connect(lp).connect(out)
    n.start()
    this.tvNodes = { gain, formants }
  }

  /* ----- event layers (scheduled) ----- */
  private env(g: GainNode, when: number, peak: number, attack: number, decay: number) {
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(peak, when + attack); g.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay)
  }
  private pluck(freq: number, when: number, gain: number) {
    const ctx = this.ctx!
    const out = ctx.createGain(); this.env(out, when, gain, 0.012, 6.5)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, when); lp.frequency.exponentialRampToValueAtTime(700, when + 4); lp.Q.value = 1.4
    for (const [m, type, g] of [[1, 'sawtooth', 0.55], [2, 'triangle', 0.3], [3, 'sine', 0.2], [1.004, 'triangle', 0.25]] as [number, OscillatorType, number][]) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq * m
      const og = ctx.createGain(); og.gain.value = g; o.connect(og).connect(lp); o.start(when); o.stop(when + 7)
    }
    lp.connect(out); out.connect(this.bus.tanpura); out.connect(this.reverb!)
  }
  private click(when: number, f: number, peak: number, dur = 0.05, type: OscillatorType = 'square') {
    const ctx = this.ctx!
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f
    const g = ctx.createGain(); this.env(g, when, peak, 0.002, dur)
    o.connect(bp).connect(g); o.start(when); o.stop(when + dur + 0.02)
    return g
  }
  private burst(when: number, bus: GainNode, freq: number, peak: number, dur: number, q = 1.5) {
    const ctx = this.ctx!
    const s = ctx.createBufferSource(); s.buffer = this.noiseBuf
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q
    const g = ctx.createGain(); this.env(g, when, peak, 0.002, dur)
    s.connect(bp).connect(g).connect(bus); s.start(when, Math.random() * 3, dur + 0.05)
  }

  private schedule = () => {
    const ctx = this.ctx
    if (!ctx || !this.running) return
    const now = ctx.currentTime, horizon = now + 0.6
    const on = (l: Layer) => this.wanted.has(l)
    const due = (k: string, init = 0.1) => { if (this.next[k] === undefined) this.next[k] = now + init; return this.next[k] < horizon }

    if (on('tanpura')) { const cycle = [196.0, 261.63, 261.63, 65.41]; while (due('tp')) { this.pluck(cycle[this.step % 4], this.next.tp, this.step % 4 === 3 ? 0.14 : 0.085); this.next.tp += 1.35; this.step++ } }
    if (on('clock')) { while (due('ck', 0.5)) { const tock = Math.round(this.next.ck) % 2 === 0; this.click(this.next.ck, tock ? 1350 : 1750, 0.2, 0.045); this.next.ck += 1.0 } }
    if (on('typewriter')) {
      // a line of keystrokes, a bell, a carriage return, a pause
      while (due('tw', 0.4)) {
        let t = this.next.tw
        const keys = 9 + Math.floor(Math.random() * 7)
        for (let i = 0; i < keys; i++) { t += 0.11 + Math.random() * 0.1; this.burst(t, this.bus.typewriter, 2300 + Math.random() * 900, 0.5, 0.03, 2); this.click(t, 150 + Math.random() * 50, 0.35, 0.05, 'sine') }
        t += 0.25
        const bell = ctx.createOscillator(); bell.type = 'sine'; bell.frequency.value = 2250
        const bg = ctx.createGain(); this.env(bg, t, 0.22, 0.002, 1.3); bell.connect(bg).connect(this.bus.typewriter); bell.start(t); bell.stop(t + 1.4)
        const sw = ctx.createBufferSource(); sw.buffer = this.noiseBuf; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1400, t + 0.3); lp.frequency.exponentialRampToValueAtTime(300, t + 0.9)
        const sg = ctx.createGain(); this.env(sg, t + 0.3, 0.35, 0.05, 0.55); sw.connect(lp).connect(sg).connect(this.bus.typewriter); sw.start(t + 0.3, 0, 0.7)
        this.next.tw = t + 2.2 + Math.random() * 3.5
      }
    }
    if (on('household')) {
      while (due('hh', 2)) {
        const t = this.next.hh, r = Math.random()
        if (r < 0.55) { this.click(t, 3100 + Math.random() * 400, 0.14, 0.18, 'sine'); this.click(t + 0.01, 4700, 0.07, 0.12, 'sine') }
        else if (r < 0.8) { this.burst(t, this.bus.household, 380, 0.25, 0.5, 0.7) }
        else { // distant pressure-cooker whistle
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 2350
          const v = ctx.createOscillator(); v.frequency.value = 7; const vg = ctx.createGain(); vg.gain.value = 26; v.connect(vg).connect(o.frequency)
          const g = ctx.createGain(); this.env(g, t, 0.07, 0.15, 1.3); o.connect(g).connect(this.bus.household); o.start(t); v.start(t); o.stop(t + 1.6); v.stop(t + 1.6)
        }
        this.next.hh = t + 2.5 + Math.random() * 6
      }
    }
    if (on('birds')) {
      while (due('bd', 1)) {
        let t = this.next.bd
        const n = 2 + Math.floor(Math.random() * 4)
        for (let i = 0; i < n; i++) { const o = ctx.createOscillator(); o.type = 'sine'; const f0 = 2800 + Math.random() * 900; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (1.2 + Math.random() * 0.3), t + 0.07); const g = ctx.createGain(); this.env(g, t, 0.09, 0.01, 0.1); o.connect(g).connect(this.bus.birds); o.start(t); o.stop(t + 0.2); t += 0.12 + Math.random() * 0.08 }
        this.next.bd = t + 3 + Math.random() * 7
      }
    }
    if (on('tv') && this.tvNodes) {
      // syllabic modulation of the formants: distant voices that never quite resolve into words
      while (due('tv', 0.2)) {
        const t = this.next.tv
        this.tvNodes.gain.gain.setTargetAtTime(Math.random() < 0.2 ? 0.0 : 0.2 + Math.random() * 0.45, t, 0.03)
        this.tvNodes.formants.forEach((f, i) => f.frequency.setTargetAtTime([420 + Math.random() * 300, 1100 + Math.random() * 700, 2100 + Math.random() * 600][i], t, 0.04))
        this.next.tv = t + 0.11 + Math.random() * 0.17
      }
    }
  }

  private applyLevels() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    for (const { id } of LAYERS) this.bus[id].gain.setTargetAtTime(this.running && this.wanted.has(id) ? LEVEL[id] : 0, t, 0.9)
  }

  /** Begin (or resume) the soundscape. Must be called from a user gesture the first time. */
  async start(volume = this.volume) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    this.volume = volume
    if (ctx.state === 'suspended') await ctx.resume()
    this.running = true
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.8)
    if (!this.started.fan) { this.startFan(); this.started.fan = true }
    if (!this.started.rain) { this.startRain(); this.started.rain = true }
    if (!this.started.tv) { this.startTv(); this.started.tv = true }
    this.next = {}
    if (this.timer === null) this.timer = window.setInterval(this.schedule, 200)
    this.applyLevels(); this.schedule()
  }

  stop() {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    this.running = false
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.35)
    if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null }
  }

  setVolume(v: number) {
    this.volume = v
    if (this.ctx && this.master && this.running) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.15)
  }

  /** Which layers should be audible right now. */
  setLayers(layers: Iterable<Layer>) {
    this.wanted = new Set(layers)
    for (const k of Object.keys(this.next)) if (!this.wanted.size) delete this.next[k]
    this.applyLevels()
  }
}

export const ambient = new Ambient()

/* ---------- which layers belong to which place ---------- */
type Place = 'living-room' | 'dining-room' | 'kitchen' | 'parents-bedroom' | 'boys-room' | 'balcony' | 'courtyard'
const ROOM: Record<Place, Layer[]> = {
  'living-room': ['tanpura', 'clock', 'fan', 'tv', 'household'],
  'dining-room': ['tanpura', 'clock', 'household'],
  kitchen: ['tanpura', 'household'],
  'parents-bedroom': ['tanpura', 'clock', 'fan'],
  'boys-room': ['tanpura', 'clock', 'fan'],
  balcony: ['tanpura', 'birds', 'household'],
  courtyard: ['tanpura', 'birds'],
}
/** The soundscape for a room, a time of day, and — in the year of the story — the season and the scene. */
export function layersFor(opts: { room: Place; time?: string; chapter?: number | null }): Layer[] {
  const set = new Set<Layer>(ROOM[opts.room] ?? ['tanpura'])
  if (opts.time === 'night') { set.delete('birds'); set.delete('tv') }
  if (opts.time === 'morning' || opts.time === 'afternoon') set.delete('tv')
  // chapter 1: Raj types at night in the living room
  if (opts.chapter === 0 && opts.room === 'living-room' && opts.time === 'night') { set.add('typewriter'); set.delete('tv') }
  // chapters 8–9 (June, July): the monsoon
  if (opts.chapter === 7 || opts.chapter === 8) { set.add('rain'); set.delete('birds') }
  // heavy conversations get less clutter
  if (opts.chapter !== undefined && opts.chapter !== null && opts.chapter >= 8 && opts.room === 'living-room') set.delete('tv')
  return [...set]
}
