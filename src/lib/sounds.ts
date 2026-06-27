let _ctx: AudioContext | null = null

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function knock(vol: number, freq: number, ms: number, delayMs = 0) {
  const c = ctx()
  const t = c.currentTime + delayMs / 1000
  const dur = ms / 1000

  const samples = Math.floor(c.sampleRate * dur * 2)
  const buf = c.createBuffer(1, samples, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < samples; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * dur * 0.38))
  }

  const src = c.createBufferSource()
  src.buffer = buf

  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = 1.6

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = freq * 2.8

  const g = c.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.2)

  src.connect(bp)
  bp.connect(lp)
  lp.connect(g)
  g.connect(c.destination)
  src.start(t)
  src.stop(t + dur * 2)
}

function beep(freq: number, vol: number, durMs: number, delayMs = 0) {
  const c = ctx()
  const t = c.currentTime + delayMs / 1000
  const dur = durMs / 1000
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t)
  osc.stop(t + dur)
}

export const sounds = {
  move()    { knock(0.62, 850, 88) },
  capture() { knock(0.78, 680, 110); knock(0.38, 1100, 72, 42) },
  check()   { knock(0.72, 680, 110); knock(0.48, 780, 90, 55); beep(220, 0.22, 700, 110); beep(233, 0.16, 500, 160); beep(440, 0.10, 400, 260) },
  gameOver(){ [440, 554, 659, 880].forEach((f, i) => beep(f, 0.14, 400, i * 115)) },
}
