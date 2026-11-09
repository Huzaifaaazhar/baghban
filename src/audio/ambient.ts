/**
 * Procedural ambient sound for the Verma house — nothing sampled, nothing copyrighted.
 * A drone of plucked strings (tanpura-like), a faint room tone and, indoors, a distant clock.
 * Everything is synthesised with the Web Audio API and only starts after a user gesture.
 */

type RoomMood = 'indoor' | 'outdoor' | 'kitchen'

class Ambient {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private reverb: ConvolverNode | null = null
  private noiseGain: GainNode | null = null
  private timer: number | null = null
  private nextPluck = 0
  private step = 0
  private nextTick = 0
  private volume = 0.5
  private running = false
  private mood: RoomMood = 'indoor'

  get isRunning() { return this.running }

  private ensure() {
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    const ctx = new Ctor()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)

    // synthetic reverb impulse
    const len = ctx.sampleRate * 3.2
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    this.reverb = ctx.createConvolver()
    this.reverb.buffer = ir
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    this.reverb.connect(wet).connect(this.master)

    // room tone: brown noise through lowpass
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const nd = noiseBuf.getChannelData(0)
    let last = 0
    for (let i = 0; i < nd.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      nd[i] = last * 3.2
    }
    const src = ctx.createBufferSource()
    src.buffer = noiseBuf
    src.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 420
    this.noiseGain = ctx.createGain()
    this.noiseGain.gain.value = 0.05
    src.connect(lp).connect(this.noiseGain).connect(this.master)
    src.start()
    return ctx
  }

  private pluck(freq: number, when: number, gain = 0.1) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    out.gain.setValueAtTime(0, when)
    out.gain.linearRampToValueAtTime(gain, when + 0.012)
    out.gain.exponentialRampToValueAtTime(0.0008, when + 6.5)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(3200, when)
    lp.frequency.exponentialRampToValueAtTime(700, when + 4)
    lp.Q.value = 1.4
    const partials: [number, OscillatorType, number][] = [
      [1, 'sawtooth', 0.55], [2, 'triangle', 0.3], [3, 'sine', 0.2], [1.004, 'triangle', 0.25],
    ]
    for (const [mult, type, g] of partials) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = freq * mult
      const og = ctx.createGain()
      og.gain.value = g
      o.connect(og).connect(lp)
      o.start(when)
      o.stop(when + 7)
    }
    lp.connect(out)
    out.connect(this.master!)
    out.connect(this.reverb!)
  }

  private tick(when: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = 1800
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0, when)
    g.gain.linearRampToValueAtTime(0.012, when + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05)
    const hp = ctx.createBiquadFilter()
    hp.type = 'bandpass'
    hp.frequency.value = 1800
    o.connect(hp).connect(g).connect(this.master!)
    o.start(when)
    o.stop(when + 0.06)
  }

  private schedule = () => {
    const ctx = this.ctx
    if (!ctx || !this.running) return
    // Sa = C3. Pa, Sa', Sa', Sa(low): the classic tanpura cycle.
    const cycle = [196.0, 261.63, 261.63, 65.41]
    while (this.nextPluck < ctx.currentTime + 0.6) {
      this.pluck(cycle[this.step % 4], this.nextPluck, this.step % 4 === 3 ? 0.14 : 0.085)
      this.nextPluck += 1.35
      this.step++
    }
    if (this.mood !== 'outdoor') {
      while (this.nextTick < ctx.currentTime + 0.6) {
        this.tick(this.nextTick)
        this.nextTick += 1.0
      }
    }
  }

  async start(volume = this.volume) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    this.volume = volume
    if (ctx.state === 'suspended') await ctx.resume()
    this.running = true
    this.nextPluck = ctx.currentTime + 0.1
    this.nextTick = ctx.currentTime + 0.5
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.8)
    if (this.timer === null) this.timer = window.setInterval(this.schedule, 250)
    this.schedule()
  }

  stop() {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    this.running = false
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.35)
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  setVolume(v: number) {
    this.volume = v
    if (this.ctx && this.master && this.running) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.15)
    }
  }

  setMood(mood: RoomMood) {
    this.mood = mood
    if (this.ctx && this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(mood === 'outdoor' ? 0.09 : mood === 'kitchen' ? 0.065 : 0.045, this.ctx.currentTime, 0.8)
    }
  }
}

export const ambient = new Ambient()
