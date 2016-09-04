let abs = Math.abs;
// let fround = Math.fround;
// let e = Number.EPSILON != null ? Number.EPSILON : 1e-14;
let e = 0.00000001;

/**
 * Compares floating point values with some tolerance (epsilon).
 * 
 * @param {number} f1 The first operand.
 * @param {number} f2 The second operand.
 * @returns {boolean} Whether `f1` and `f2` are close enough to be considered equal.
 */
function tolerantCompare(f1: number, f2: number): boolean {
  return abs(f1 - f2) < e;
  // return fround(f1) === fround(f2);
}

export default tolerantCompare;