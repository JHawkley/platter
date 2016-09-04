import VectorLike from '../types/vector-like';
import { Maybe, hasValue } from 'common/monads';

let { sqrt, atan2, sin, cos, acos } = Math;

function set<T extends VectorLike>(out: T, op: VectorLike): T {
  out.x = op.x; out.y = op.y; return out;
}

function setXY<T extends VectorLike>(out: T, x: number, y: number): T {
  out.x = x; out.y = y; return out;
}

function add<T extends VectorLike>(out: T, a: VectorLike, b: VectorLike) {
  return setXY(out, a.x + b.x, a.y + b.y);
}

function sub<T extends VectorLike>(out: T, a: VectorLike, b: VectorLike) {
  return setXY(out, a.x - b.x, a.y - b.y);
}

function mul<T extends VectorLike>(out: T, op: VectorLike, s: number) {
  return setXY(out, op.x * s, op.y * s);
}

function $length(op: VectorLike): number {
  let { x, y } = op;
  return sqrt(x*x + y*y);
}

function makeLength<T extends VectorLike>(out: T, op: VectorLike, len: number): T {
  if (len < 0) throw new Error('length must not be less than 0');
  if (len === 0) return setXY(out, 0, 0);
  if (op.x === 0 && op.y === 0) return setXY(out, 0, len);
  return mul(out, op, len / $length(op));
}

function angle(op: VectorLike): number { return atan2(op.x, op.y); }

function rotate<T extends VectorLike>(out: T, op: VectorLike, ra: number): T {
  let { x, y } = op; ra *= -1;
  let ax = sin(ra);
  let ay = cos(ra);
  return setXY(out, x * ay - y * ax, x * ax + y * ay);
}

function unit<T extends VectorLike>(out: T, op: VectorLike): T {
  let x: number, y: number;
  if (op.x === 0 && op.y === 0) { x = 0; y = 0; }
  else { let il = 1 / $length(op); x = op.x * il; y = op.y * il; }
  return setXY(out, x, y);
}

function perpR<T extends VectorLike>(out: T, op: VectorLike): T {
  return setXY(out, -op.y, op.x);
}

function perpL<T extends VectorLike>(out: T, op: VectorLike): T {
  return setXY(out, op.y, -op.x);
}

function dot(a: VectorLike, b: VectorLike): number { return (a.x * b.x) + (a.y * b.y); }

function cross(a: VectorLike, b: VectorLike): number { return (a.x * b.y) - (a.y * b.x); }

function project(v: VectorLike, target: VectorLike) {
  let lenTarget = $length(target);
  return dot(v, target) / (lenTarget * lenTarget);
}

function angleBetween(a: VectorLike, b: VectorLike) {
  return acos(dot(a, b) / ($length(a) * $length(b)));
}

function equals(a: Maybe<VectorLike>, b: Maybe<VectorLike>): boolean {
  if (!hasValue(a) || !hasValue(b)) return false;
  if (a.x !== b.x || a.y !== b.y) return false;
  return true;
}

export { set, setXY };
export { add, sub, mul };
export { $length as length, makeLength };
export { angle, rotate };
export { unit, perpR, perpL };
export { dot, cross };
export { project, angleBetween, equals };