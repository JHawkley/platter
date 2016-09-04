import { set, setXY, mul, add, sub, unit } from '../math/vector-math';
import VectorLike from '../types/vector-like';
import RectLike from '../types/rect-like';
import CircleLike from '../types/circle-like';
import LineLike from '../types/line-like';
import distance from '../utils/distance';

export function aabb<T extends VectorLike>(out: T, aabb: RectLike, v: VectorLike): T {
  let { x: vx, y: vy } = v;

  if (vx <= 0) vx = 0;
  else vx = 1;

  if (vy <= 0) vy = 0;
  else vy = 1;

  setXY(out, (vx * aabb.width) + aabb.x, (vy * aabb.height) + aabb.y);
  return out;
}

export function circle<T extends VectorLike>(out: T, c: CircleLike, v: VectorLike): T {
  unit(out, v);
  mul(out, out, c.radius);
  add(out, out, c);
  return out;
}

export function line<T extends VectorLike>(out: T, line: LineLike, v: VectorLike): T {
  let { point1: p1, point2: p2 } = line;
  set(out, p1);
  sub(out, out, p2);
  let d1 = distance(out, v);
  mul(out, out, -1);
  let d2 = distance(out, v);

  if (d1 <= d2) {
    set(out, p1);
  } else {
    set(out, p2);
  }
  return out;
}

export function point<T extends VectorLike>(out: T, p: VectorLike, v: VectorLike): T {
  return set(out, p);
}