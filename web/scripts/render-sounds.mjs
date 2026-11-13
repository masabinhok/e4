// e4's sound set is synthesised here, not sampled, so it's original to e4.
// Renders each sound with OfflineAudioContext in headless Chromium and writes WAVs:
//   node scripts/render-sounds.mjs /tmp/e4-sounds
//   for f in /tmp/e4-sounds/*.wav; do ffmpeg -y -i "$f" -ac 1 -b:a 96k "public/sounds/$(basename "$f" .wav).mp3"; done
import { chromium } from "playwright";
import fs from "fs";
const out = process.argv[2];
const SOUNDS = {
  move: [
    ["knock", 0, 950, 4, 0.09, 1.6],
    ["tone", 0, 190, 0.09, 0.35],
  ],
  "move-opponent": [
    ["knock", 0, 820, 4, 0.085, 1.35],
    ["tone", 0, 165, 0.09, 0.3],
  ],
  capture: [
    ["knock", 0, 820, 3, 0.1, 2.0],
    ["tone", 0, 160, 0.1, 0.4],
    ["knock", 0.05, 1100, 4, 0.07, 1.2],
  ],
  check: [
    ["knock", 0, 950, 4, 0.09, 1.6],
    ["tone", 0, 190, 0.09, 0.35],
    ["tone", 0.04, 1568, 0.14, 0.09],
  ],
  castle: [
    ["knock", 0, 950, 4, 0.08, 1.4],
    ["tone", 0, 190, 0.08, 0.3],
    ["knock", 0.11, 880, 4, 0.08, 1.4],
    ["tone", 0.11, 175, 0.08, 0.3],
  ],
  correct: [
    ["tone", 0, 784, 0.35, 0.25],
    ["tone", 0.1, 1175, 0.45, 0.22],
  ],
  wrong: [
    ["tone", 0, 140, 0.25, 0.3, "triangle"],
    ["lowthud", 0, 400, 0.12, 0.6],
  ],
  illegal: [["tone", 0, 110, 0.12, 0.22, "triangle"]],
  complete: [523, 659, 784, 1047].map((f, i) => [
    "tone",
    i * 0.1,
    f,
    0.5,
    0.22,
  ]),
  "clean-run": [
    ...[523, 659, 784, 1047, 1319].map((f, i) => [
      "tone",
      i * 0.09,
      f,
      0.55,
      0.2,
    ]),
    ["tone", 0.45, 2638, 0.35, 0.04],
  ],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [name, parts] of Object.entries(SOUNDS)) {
    const data = await p.evaluate(async (parts) => {
      const sr = 44100,
        end =
          Math.max(
            ...parts.map(
              (x) =>
                x[1] +
                (x[0] === "tone" ? x[3] : x[0] === "knock" ? x[4] : x[3]),
            ),
          ) + 0.08;
      const c = new OfflineAudioContext(1, Math.ceil(sr * end), sr);
      const noise = (t, dur, type, freq, q, gain) => {
        const len = Math.ceil(sr * dur),
          buf = c.createBuffer(1, len, sr),
          d = buf.getChannelData(0);
        let seed = 7;
        const rnd = () =>
          ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1; // deterministic noise
        for (let i = 0; i < len; i++) d[i] = rnd() * Math.pow(1 - i / len, 3);
        const s = c.createBufferSource();
        s.buffer = buf;
        const f = c.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = q;
        const g = c.createGain();
        g.gain.value = gain;
        s.connect(f).connect(g).connect(c.destination);
        s.start(t);
      };
      const tone = (t, freq, dur, gain, type = "sine") => {
        const o = c.createOscillator(),
          g = c.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(c.destination);
        o.start(t);
        o.stop(t + dur + 0.02);
      };
      for (const [kind, t, a, b2, c2, d2] of parts) {
        if (kind === "knock") noise(t, c2, "bandpass", a, b2, d2);
        else if (kind === "lowthud") noise(t, b2, "lowpass", a, 1, c2);
        else tone(t, a, b2, c2, d2);
      }
      const rendered = (await c.startRendering()).getChannelData(0);
      const peak = Math.max(...rendered.map(Math.abs)) || 1;
      return Array.from(rendered, (v) => (v / peak) * 0.89); // normalise to about -1 dBFS
    }, parts);
    const pcm = Buffer.alloc(data.length * 2);
    data.forEach((v, i) => pcm.writeInt16LE(Math.round(v * 32767), i * 2));
    const h = Buffer.alloc(44);
    h.write("RIFF", 0);
    h.writeUInt32LE(36 + pcm.length, 4);
    h.write("WAVEfmt ", 8);
    h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20);
    h.writeUInt16LE(1, 22);
    h.writeUInt32LE(44100, 24);
    h.writeUInt32LE(88200, 28);
    h.writeUInt16LE(2, 32);
    h.writeUInt16LE(16, 34);
    h.write("data", 36);
    h.writeUInt32LE(pcm.length, 40);
    fs.writeFileSync(`${out}/${name}.wav`, Buffer.concat([h, pcm]));
  }
  await b.close();
})();
