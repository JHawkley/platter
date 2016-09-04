import comp from './tolerant-compare';

const pi2 = Math.PI * 2;
function modulo(a: number, b: number): number { return (+a % (b = +b) + b) % b; }

function normalizeAngle_Deg(input: number): number { return modulo(input, 360); }
function normalizeAngle_Rad(input: number): number { return modulo(input, pi2); }

/**
 * Compares two angles, in degrees, such that multiple revolutions
 * are normalized to a range between `0` and `360`.
 * 
 * @param {number} a The first angle.
 * @param {number} b The second angle.
 * @returns {boolean}
 */
function compareAngle_Deg(a: number, b: number): boolean {
  if (a < 0 || a >= 360) a = normalizeAngle_Deg(a);
  if (b < 0 || b >= 360) b = normalizeAngle_Deg(b);
  return comp(a, b);
}

/**
 * Compares two angles, in radians, such that multiple revolutions
 * are normalized to a range between `0` and `PI*2`.
 * 
 * @param {number} a The first angle.
 * @param {number} b The second angle.
 * @returns {boolean}
 */
function compareAngle_Rad(a: number, b: number): boolean {
  if (a < 0 || a >= pi2) a = normalizeAngle_Rad(a);
  if (b < 0 || b >= pi2) b = normalizeAngle_Rad(b);
  return comp(a, b);
}

export { compareAngle_Deg as compareAngleDegrees };
export { compareAngle_Rad as compareAngleRadians };
export default compareAngle_Rad;