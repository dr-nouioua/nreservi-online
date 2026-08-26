// Reservation alert sound — Web Audio chime (no audio files needed).

let ctx: AudioContext | null = null;
const STORAGE_KEY = "nreservi-sound";

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}
}

/** Browsers require a user gesture before audio — call this on any click. */
export function ensureAudio(): void {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {}
}

/** Two-tone "ding-dong" chime for a new reservation. */
export function playReservationChime(): void {
  if (!soundEnabled()) return;
  try {
    ensureAudio();
    if (!ctx || ctx.state === "suspended") return;
    const t = ctx.currentTime;
    [880, 1174.7].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  } catch {}
}
