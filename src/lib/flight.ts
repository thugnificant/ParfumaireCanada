/** Scroll choreography measured against the supplied Bella recording (7.9–8.9s).
 * The room scrolls normally; the cabinet releases, drops, turns and rests.
 * Hermite segments preserve velocity through each stage and work in reverse.
 */
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const restingPose = { pitch: 0.33, yaw: 0.34, roll: 0 };
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
type Key = readonly [time: number, value: number, velocity: number];
function curve(progress: number, keys: readonly Key[]) {
  const p = clamp(progress);
  for (let i = 1; i < keys.length; i++) {
    const [a, av, am] = keys[i - 1],
      [b, bv, bm] = keys[i];
    if (p <= b) {
      const span = b - a,
        t = (p - a) / span,
        t2 = t * t,
        t3 = t2 * t;
      return (
        (2 * t3 - 3 * t2 + 1) * av +
        (t3 - 2 * t2 + t) * span * am +
        (-2 * t3 + 3 * t2) * bv +
        (t3 - t2) * span * bm
      );
    }
  }
  return keys[keys.length - 1][1];
}
export function flightAt(progress: number) {
  const p = clamp(progress);
  return {
    drop: curve(p, [
      [0, 0, 0.45],
      [0.24, 0.14, 1],
      [0.62, 0.7, 1.55],
      [0.9, 0.995, 0.15],
      [1, 1, 0],
    ]),
    travel: smooth((p - 0.1) / 0.78),
    depth: smooth((p - 0.12) / 0.76),
    contact: smooth((p - 0.84) / 0.16),
    pitch: curve(p, [
      [0, -0.12, 0],
      [0.48, 0.17, 0],
      [0.86, 0.31, 0],
      [1, restingPose.pitch, 0],
    ]),
    yaw: curve(p, [
      [0, -0.48, 0],
      [0.48, 0.22, 0],
      [0.86, 0.32, 0],
      [1, restingPose.yaw, 0],
    ]),
    roll: curve(p, [
      [0, -0.12, 0],
      [0.46, 0.14, 0],
      [0.86, -0.026, 0],
      [1, 0, 0],
    ]),
  };
}
