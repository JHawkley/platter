type Point = { x: number, y: number };
let sqrt = Math.sqrt;

/**
 * Calculates the distance between two points.
 * 
 * @param {Point} p1 The first point.
 * @param {Point} p2 The second point.
 * @returns {number}
 */
function distance(p1: Point, p2: Point): number {
  let x = p2.x - p1.x, y = p2.y - p1.y;
  return sqrt(x*x + y*y);
}

export default distance;