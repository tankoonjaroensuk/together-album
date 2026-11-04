/** Keeps `value` within [`min`, `max`]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Height of a string that hangs `sag` px lower in the middle than at its two ends (both at `anchorY`), at horizontal position `x`. */
export function getStringY(x: number, stringWidth: number, anchorY: number, sag: number): number {
  const progress = clamp(x / stringWidth, 0, 1)
  return anchorY + 4 * sag * progress * (1 - progress)
}

/** One step of a critically damped spring pulling `position` toward `target`. */
export function stepSpring(
  position: number,
  velocity: number,
  target: number,
  deltaSeconds: number,
  stiffness = 70,
): [position: number, velocity: number] {
  const damping = 2 * Math.sqrt(stiffness)
  const nextVelocity = velocity + (stiffness * (target - position) - damping * velocity) * deltaSeconds
  return [position + nextVelocity * deltaSeconds, nextVelocity]
}

const GRAVITY_PULL = 38
const SWING_DAMPING = 4.2
const LINE_VELOCITY_TO_TORQUE = 0.0034
const MAX_SWING_ANGLE_RAD = 0.6

/**
 * One step of a print swinging on its peg. A print lags behind the line's on-screen velocity
 * (px/s, positive = moving right), is pulled back upright by gravity and damped. `gain` scales
 * how strongly the line's motion shakes it; 0 holds the print still.
 */
export function stepSwing(
  angle: number,
  angularVelocity: number,
  lineVelocity: number,
  deltaSeconds: number,
  gain: number,
): [angle: number, angularVelocity: number] {
  const angularAcceleration = -GRAVITY_PULL * angle - SWING_DAMPING * angularVelocity + lineVelocity * LINE_VELOCITY_TO_TORQUE * gain
  const nextAngularVelocity = angularVelocity + angularAcceleration * deltaSeconds
  const nextAngle = clamp(angle + nextAngularVelocity * deltaSeconds, -MAX_SWING_ANGLE_RAD, MAX_SWING_ANGLE_RAD)
  return [nextAngle, nextAngularVelocity]
}

/** Index of the print closest to the centre when the line is scrolled by `offset` px. */
export function getNearestIndex(offset: number, spacing: number, photoCount: number): number {
  return clamp(Math.round(offset / spacing), 0, Math.max(0, photoCount - 1))
}
