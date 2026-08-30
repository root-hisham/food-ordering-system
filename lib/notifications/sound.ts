"use client";

let sharedContext: AudioContext | null = null;

/**
 * Browsers require a real user gesture (tap/click) before audio can
 * play — a WebSocket event from Realtime doesn't count as one, so a
 * beep triggered directly inside the realtime handler can be
 * silently blocked. Call this once on the first tap anywhere on the
 * page to "unlock" a reusable AudioContext ahead of time.
 */
export function unlockAudio() {
  if (sharedContext) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedContext = new AudioContextClass();
    const buffer = sharedContext.createBuffer(1, 1, 22050);
    const source = sharedContext.createBufferSource();
    source.buffer = buffer;
    source.connect(sharedContext.destination);
    source.start(0);
  } catch {
    // Ignore — playNotificationSound will just no-op later.
  }
}

export function playNotificationSound() {
  try {
    const ctx = sharedContext ?? new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    [0, 0.15].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 880 : 1175;
      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.3);
    });
  } catch {
    // Audio blocked/unsupported — vibration + visual popup still work.
  }
}