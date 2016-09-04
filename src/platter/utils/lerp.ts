/**
 * Linearly interpolates between two numbers.
 * 
 * @param {number} n1 The first number.
 * @param {number} n2 The second number.
 * @param {number} v A value that linearly interpolates between `n1` and `n2`.
 * @returns {number}
 */
function lerp(n1: number, n2: number, v: number): number {
  return n1 + (n2 - n1) * v;
}

export default lerp;