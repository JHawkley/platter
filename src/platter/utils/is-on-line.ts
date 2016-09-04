import VectorLike from '../types/vector-like';
import comp from './tolerant-compare';

/**
 * Checks to see if `p` is on a line made up of points `a` and `b`.
 * 
 * Setting `asSegment` to `true` will also check that `p` is in-between
 * `a` and `b` on the line, treating it as a line segment, rather than
 * a line extending into infinity.
 * 
 * @param {VectorLike} a The first point of the line.
 * @param {VectorLike} b The second point of the line.
 * @param {VectorLike} p The point to test.
 * @param {boolean} [asSegment=false] Whether to treat the points as a line-segment.
 * @returns {boolean}
 */
function isOnLine(a: VectorLike, b: VectorLike, p: VectorLike, asSegment = false): boolean {
  let retVal = colinear(a, b, p);
  if (retVal && asSegment)
    retVal = withinCheck(a, b, p);
  return retVal;
}

function withinCheck(a: VectorLike, b: VectorLike, p: VectorLike) {
  return (a.x != b.x) ? within(a.x, p.x, b.x) : within(a.y, p.y, b.y);
}

function colinear(a: VectorLike, b: VectorLike, p: VectorLike) {
  return comp((b.x - a.x) * (p.y - a.y), (p.x - a.x) * (b.y - a.y));
}

function within(p: number, q: number, r: number) {
  return (p <= q && q <= r) || (r <= q && q <= p);
}

export default isOnLine;