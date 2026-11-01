import assert from 'node:assert/strict';
import { flightAt, restingPose } from '../src/lib/flight.ts';

// The previous end-of-flight override jumped to another rotation on contact.
// Keep the animated and stationary poses identical and arrive at zero velocity.
const finish = flightAt(1);
for (const axis of ['pitch', 'yaw', 'roll']) {
  assert.equal(finish[axis], restingPose[axis], `${axis}: no pose switch on contact`);
  const arrivingVelocity = (finish[axis] - flightAt(0.9999)[axis]) / 0.0001;
  assert(Math.abs(arrivingVelocity) < 0.002, `${axis}: settle before resting`);
}
assert.deepEqual(flightAt(-1), flightAt(0));
assert.deepEqual(flightAt(2), finish);
let previous = flightAt(0);
const samples = [];
for (let i = 0; i <= 1000; i++) {
  const pose = flightAt(i / 1000);
  for (const value of Object.values(pose)) assert(Number.isFinite(value));
  for (const key of ['drop', 'travel', 'depth', 'contact']) {
    assert(pose[key] >= previous[key] - 1e-10, `${key}: no reversal or floor overshoot`);
    assert(pose[key] <= 1 && pose[key] >= 0);
  }
  for (const key of Object.keys(pose)) {
    // Contact is a short light/shadow ramp; position and angle need the tighter bound.
    const limit = key === 'contact' ? 0.01 : 0.007;
    assert(Math.abs(pose[key] - previous[key]) < limit, `${key}: no frame jump`);
  }
  samples.push(pose);
  previous = pose;
}
for (let i = 1000; i >= 0; i--) assert.deepEqual(flightAt(i / 1000), samples[i]);
console.log(
  'Flight checks passed: continuous reversible pose, monotonic descent, no floor overshoot, zero-velocity contact.',
);
