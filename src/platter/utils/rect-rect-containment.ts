import RectLike from '../types/rect-like';

/**
 * Tests if `rect` is fully contained within `bounds`.
 * 
 * @param {RectLike} rect The rectangle to test.
 * @param {RectLike} bounds The rectangle that may contain `rect`.
 * @returns {boolean}
 */
function rectRectContainment(rect: RectLike, bounds: RectLike): boolean {
  return (
    rect.x >= bounds.x && rect.y >= bounds.y &&
    rect.x + rect.width <= bounds.x + bounds.width &&
    rect.y + rect.height <= bounds.y + bounds.height
  );
}

export default rectRectContainment;