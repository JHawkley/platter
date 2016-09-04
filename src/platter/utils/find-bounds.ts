import RectLike from '../types/rect-like';
let { min, max } = Math;

/**
 * Generates a rectangle which contains all the rectangles in `arr`
 * and copies it to the rectangle given as `out`.
 * 
 * Results in a rectangle with `0` width and height if the array is empty.
 * 
 * @template T
 * @param {T} out The rectangle-like object to be set to cumulative bounds.
 * @param {Array<RectLike>} arr An array of rectangle-like objects.
 * @returns {T}
 */
function findBounds<T extends RectLike>(out: T, arr: Array<RectLike>): T {
  if (arr.length === 0) {
    return (out.x = out.y = out.width = out.height = 0, out);
  } else {
    let top: number, left: number, bottom: number, right: number;
    top = left = Number.POSITIVE_INFINITY;
    bottom = right = Number.NEGATIVE_INFINITY;
    for(let i = 0, len = arr.length; i < len; i++) {
      let { x, y, width, height } = arr[i];
      top = min(top, y);
      left = min(left, x);
      bottom = max(bottom, y + height);
      right = max(right, x + width);
    }
    out.x = left; out.y = top;
    out.width = right - left;
    out.height = bottom - top;
    return out;
  }
}

export default findBounds;