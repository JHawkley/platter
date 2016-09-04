type RectLike = { x: number, y: number, width: number, height: number };
let { min, max } = Math;

/**
 * .NET's rectangle intersection function.
 * Test if two axis-aligned rectangles intersect.
 * 
 * @param {RectLike} a The first rectangle.
 * @param {RectLike} b The second rectangle.
 * @returns {boolean}
 */
function rectRectIntersection(a: RectLike, b: RectLike): boolean {
  let x = max(a.x, b.x);
  let num1 = min(a.x + a.width, b.x + b.width);
  let y = max(a.y, b.y);
  let num2 = min(a.y + a.height, b.y + b.height);
  return num1 >= x && num2 >= y;
}

export default rectRectIntersection;