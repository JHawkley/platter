import { MutableVector as Vector, ImmutableVector } from './vector';
import { set, setXY, equals, add, sub, mul } from './vector-math';
import { dot, length, angleBetween, perpR, perpL, cross, project } from './vector-math';
import MinkowskiPoint from './minkowski-point';
import _Simplex from './simplex';
import VectorLike from '../types/vector-like';
import { hasValue } from 'common/monads';
import isOnLine from '../utils/is-on-line';
import { uniq, filter } from '../utils/array';

// Indicates `a` and `b` on a portal are the same point.
const sShutPortal: 'shut' = 'shut';
// Indicates one of `a` or `b` on a portal are the same as the `viewPoint`.
const sHingedPortal: 'hinged' = 'hinged';
// Indicates all of `a`, `b`, and `viewPoint` of a portal are the same point.
const sSingularity: 'singularity' = 'singularity';
// Indicates the portal is perfectly healthy.
const sValid: 'valid' = 'valid';

// Indicates `a` will create the shortest translation vector.
const sAShortest: 'a-shortest' = 'a-shortest';
// Indicates `b` will create the shortest translation vector.
const sBShortest: 'b-shortest' = 'b-shortest';

interface ISupported {
  support<T extends VectorLike>(out: T, v: VectorLike): T;
  centerOf<T extends VectorLike>(out: T): T;
}

type PortalValidity = typeof sShutPortal | typeof sHingedPortal | typeof sSingularity | typeof sValid;
type ShortestTransVector = typeof sAShortest | typeof sBShortest;

function makeVec(): VectorLike { return { x: 0, y: 0 }; };
const zeroVector = ImmutableVector.create(0, 0);

// Working vectors belonging to the `Portal` class.
const pv1 = makeVec();
const pv2 = makeVec();
const pv3 = makeVec();
class Portal {

  get viewPoint(): MinkowskiPoint { return this._vp; }

  get a(): MinkowskiPoint { return this._a; }
  set a(val: MinkowskiPoint) {
    if (this._a) this._a.release();
    this._a = val;
  }

  get b(): MinkowskiPoint { return this._b; }
  set b(val: MinkowskiPoint) {
    if (this._b) this._b.release();
    this._b = val;
  }

  /**
   * Whether the portal is actually made up of three different points.
   * If not, the portal isn't a portal, but more a kinf of line or point.
   * These cases need special handling.
   * 
   * @readonly
   * @type {PortalValidity}
   */
  get validity(): PortalValidity {
    return (0, Portal.checkValidity)(this._vp, this._a, this._b);
  }

  get angle(): number {
    switch (this.validity) {
      case 'singularity': return NaN;
      case 'shut': return 0;
      case 'hinged': return Math.PI;
      case 'valid':
        let va = sub(pv1, this.a, this._vp);
        let vb = sub(pv2, this.b, this._vp);
        let vaLen = length(va);
        let vbLen = length(vb);
        return Math.acos(dot(va, vb) / (vaLen * vbLen));
    }
  }

  private _vp: MinkowskiPoint;
  private _a: MinkowskiPoint;
  private _b: MinkowskiPoint;
  private _initialized: boolean;

  static pool: Array<Portal> = [];

  static create(vp: MinkowskiPoint, a: MinkowskiPoint, b: MinkowskiPoint): Portal {
    let instance = Portal.pool.pop() || new Portal();
    return Portal.init(instance, vp, a, b);
  }

  static init(instance: Portal, vp: MinkowskiPoint, a: MinkowskiPoint, b: MinkowskiPoint): Portal {
    instance._vp = vp;
    instance._a = a;
    instance._b = b;

    instance._initialized = true;
    return instance;
  }

  static reclaim(instance: Portal) {
    if (instance._initialized) instance.release();
    else Portal.pool.push(instance);
  }

  /**
   * Checks whether the portal is actually made up of three different points.
   * If not, the portal isn't a portal, but more a kinf of line or point.
   * These cases need special handling.
   * 
   * @static
   * @param {VectorLike} vp The view-point of the portal.
   * @param {VectorLike} a The portal's `a` component.
   * @param {VectorLike} b The portal's `b` component.
   * @returns {PortalValidity}
   */
  static checkValidity(vp: VectorLike, a: VectorLike, b: VectorLike): PortalValidity {
    let aInvalid = (vp.x === a.x && vp.y === a.y);
    let bInvalid = (vp.x === b.x && vp.y === b.y);
    if (aInvalid && bInvalid) return sSingularity;
    if (aInvalid) return sHingedPortal;
    if (bInvalid) return sHingedPortal;
    if (a.x === b.x && a.y === b.y) return sShutPortal;
    return sValid;
  }

  static equals(a: Portal, b: Portal) {
    if (!equals(a.viewPoint, b.viewPoint)) return false;
    if (equals(a._a, b._a) && equals(a._b, b._b)) return true;
    if (equals(a._a, b._b) && equals(a._b, b._a)) return true;
    return false;
  }

  constructor() { this._initialized = false; }

  release() {
    this._vp.release();
    this._a.release();
    this._b.release();
    this._vp = this._a = this._b = null as any;
    this._initialized = false;
    Portal.reclaim(this);
  }

  replaceA(v: MinkowskiPoint): this {
    this._a.release();
    this._a = v.copy();
    return this;
  }

  replaceB(v: MinkowskiPoint): this {
    this._b.release();
    this._b = v.copy();
    return this;
  }
}

function support(A: ISupported, B: ISupported, v: VectorLike): MinkowskiPoint {
  let d = set(pv3, v);
  let p1 = A.support(pv1, d);
  let p2 = B.support(pv2, mul(d, d, -1));
  let retVal = MinkowskiPoint.create(p1, p2);
  return retVal;
}

function sameSide(perp: VectorLike, v1: VectorLike, v2: VectorLike): boolean {
  let d1 = dot(v1, perp);
  let d2 = dot(v2, perp);
  if (d1 <= 0 && d2 <= 0) return true;
  if (d1 >= 0 && d2 >= 0) return true;
  return false;
}

function between(v: VectorLike, a: VectorLike, b: VectorLike, p: VectorLike): boolean {
  let va = sub(Vector.create(), a, v);
  let vb = sub(Vector.create(), b, v);
  let vp = sub(Vector.create(), p, v);
  let c1 = cross(va, vp);
  let c2 = cross(vp, vb);
  va.release(); vb.release(); vp.release();
  return (c1^c2) >= 0;
}

// Working vectors belonging to the build and refinement functions.
const fv1 = makeVec();
const fv2 = makeVec();
const fv3 = makeVec();
const fv4 = makeVec();

function buildCollision(A: ISupported, B: ISupported): Portal {
  let ca = A.centerOf(fv1);
  let cb = B.centerOf(fv2);
  let viewPoint = MinkowskiPoint.create(ca, cb);

  let vo = mul(fv1, viewPoint, -1);
  let s1 = support(A, B, vo);
  sub(fv2, s1, viewPoint);
  let perp = perpR(fv2, fv2);
  let s2 = support(A, B, mul(fv3, perp, dot(perp, vo)));
  return Portal.create(viewPoint, s1, s2);
}

function refineCollision(A: ISupported, B: ISupported, portal: Portal): boolean | null {
  let retVal: boolean | null = null;
  let { viewPoint, a, b } = portal;
  let av = sub(fv1, viewPoint, a);
  let ao = mul(fv2, a, -1);
  let ab = sub(fv3, b, a);
  let perpAB = perpR(fv3, ab);
  if (sameSide(perpAB, av, ao)) retVal = true;
  else {
    // Get a support point in a direction perpendicular to `ab` and toward point `o`.
    let c = support(A, B, mul(fv1, perpAB, dot(perpAB, ao)));
    let cv = sub(fv2, viewPoint, c);
    let co = mul(fv4, c, -1);
    // If `o` is not on the same side as `v` relative to a line parallel to line
    // `ac` that intersects `c`...
    if (!sameSide(perpAB, cv, co))
      retVal = false, c.release();
    // If `o` is within angle `avc`...
    else if (between(viewPoint, a, c, zeroVector))
      portal.b = c;
    // Else...
    else
      portal.a = c;
  }
  return retVal;
}

function buildMTV(A: ISupported, B: ISupported, portal: Portal) {
  let viewPoint = portal.viewPoint;
  // If the portal is not a valid portal, just copy the source portal.
  // The caller will handle the particular situation at hand.
  if (portal.validity !== sValid)
    return Portal.create(viewPoint, portal.a, portal.b);
  
  // Using the given portal as a basis, open things up for exploration
  // a little.  The portal's `a` and `b` may not be leading toward the
  // nearest surface of the minkowski difference's hull.  So, let's
  // get one exploratory support point, finding which of the two current
  // support points creates a line-segment nearest to the origin, and
  // then looking for a support point away from that segment.

  // First, find which of the two line-segments is closest to the origin.
  let v2o = mul(fv1, viewPoint, -1);
  let pa: VectorLike; {
    let v2a = sub(fv2, portal.a, viewPoint);
    pa = add(fv2, viewPoint, mul(fv2, v2a, project(v2o, v2a)));
  }
  let pb: VectorLike; {
    let v2b = sub(fv3, portal.b, viewPoint);
    pb = add(fv3, viewPoint, mul(fv3, v2b, project(v2o, v2b)));
  }
  // `c` is always going to be the "middling" point, that splits the two
  // new portals.  This is the convention in `smallestTranslation()`, anyways.
  let a: MinkowskiPoint, b: MinkowskiPoint, c: MinkowskiPoint;
  if (length(pa) < length(pb)) {
    a = support(A, B, pa);
    b = portal.b;
    c = portal.a;
  } else {
    a = portal.a;
    b = support(A, B, pb);
    c = portal.b;
  }
  // Now figure out which of these two candidate portals we can create has
  // the shortest translation vector.
  let result = smallestTranslation(viewPoint, a, b, c);
  if (result[0] === sAShortest)
    return Portal.create(viewPoint.copy(), a, c);
  else
    return Portal.create(viewPoint.copy(), b, c);
}

const smallestTranslationOut: [ShortestTransVector, VectorLike] = [sAShortest, { x: 0, y: 0 }];
function smallestTranslation(vp: MinkowskiPoint, a: MinkowskiPoint, b: MinkowskiPoint, c: MinkowskiPoint): [ShortestTransVector, VectorLike] {
  let vacValid = Portal.checkValidity(vp, a, c) === sValid;
  let vbcValid = Portal.checkValidity(vp, b, c) === sValid;
  
  let ca = sub(fv1, a, c);
  let cb = sub(fv2, b, c);
  let co = mul(fv3, c, -1);
  // We figure out which of the two new portals will produce a smaller translation vector.
  let j: VectorLike, k: VectorLike;
  // Have to guard against invalid points.
  if (vacValid && vbcValid) {
    j = add(fv1, c, mul(fv1, ca, project(co, ca)));
    k = add(fv2, c, mul(fv2, cb, project(co, cb)));
    let jLen = length(j), kLen = length(k);
    if (isNaN(jLen) || isNaN(kLen)) debugger;
    if (jLen < kLen) {
      smallestTranslationOut[0] = sAShortest;
      set(smallestTranslationOut[1], j);
    } else {
      smallestTranslationOut[0] = sBShortest;
      set(smallestTranslationOut[1], k);
    }
  } else if (vacValid) {
    j = add(fv1, c, mul(fv1, ca, project(co, ca)));
    smallestTranslationOut[0] = sAShortest;
    set(smallestTranslationOut[1], j);
  } else {
    k = add(fv2, c, mul(fv2, cb, project(co, cb)));
    smallestTranslationOut[0] = sBShortest;
    set(smallestTranslationOut[1], k);
  }
  return smallestTranslationOut;
}

function isPointOnLine(v: MinkowskiPoint | boolean): v is MinkowskiPoint {
  return v !== false;
}

function mpr(A: ISupported, B: ISupported): any {
  let iter = 0;
  let portal = buildCollision(A, B);
  let viewPoint = portal.viewPoint;
  let retVal: boolean | null = null;
  // Exceptional cases short-circuit.
  switch (portal.validity) {
    case 'singularity':
      // Should only happen with points.
      retVal = equals(viewPoint.s1, viewPoint.s2);
      break;
    case 'hinged':
      // Result is whether the origin lies on line-segment ab.
      retVal = isOnLine(portal.a, portal.b, zeroVector, true);
      break;
    case 'shut':
      // Result is whether the origin lies on line-segment va.
      retVal = isOnLine(viewPoint, portal.a, zeroVector, true);
      break;
    default:
      let pol = isOnLine(viewPoint, zeroVector, portal.a) ? portal.a
              : isOnLine(viewPoint, zeroVector, portal.b) ? portal.b
              : false;
      if (isPointOnLine(pol))
        // Result is whether the origin lies on line-segment vp.
        retVal = isOnLine(viewPoint, pol, zeroVector, true);
      break;
  }
  
  while(retVal === null)
    iter++, retVal = refineCollision(A, B, portal);
  return [retVal, portal, iter];
}

let mrt = 0.01;
function mtv(A: ISupported, B: ISupported, oldPortal: Portal) {
  let iter = 0;
  let portal = buildMTV(A, B, oldPortal);
  let viewPoint = portal.viewPoint;
  let retVal: Vector | null = null;
  let pol = isOnLine(viewPoint, zeroVector, portal.a) ? portal.a
          : isOnLine(viewPoint, zeroVector, portal.b) ? portal.b
          : false;
  // Direct hit short-circuit.
  if (isPointOnLine(pol)) {
    if (pol.x === 0 && pol.y === 0) {
      // Shape `A` is laying exactly on the center of `B`.
      // Set the MTV to just push the shapes apart in an upward direction.
      let c = support(A, B, setXY(fv1, 0, -1));
      retVal = c.sub(viewPoint);
      c.release();
    } else {
      // MTV is just the point that was on the line.
      retVal = pol.asMutable();
    }
  }
  else {
    // The previous iteration's angle.
    let u = Number.POSITIVE_INFINITY;
    let l: VectorLike; {
      let ab = sub(fv1, portal.b, portal.a);
      let ao = mul(fv2, portal.a, -1);
      // Point of intersection of `vo` and `ab`.
      l = add(fv4, portal.a, mul(fv4, ab, project(ao, ab)));
    }
    while (retVal === null) {
      // The current angle of the portal.
      let v = portal.angle;
      // If the angle is no longer reducing at a satisfactory rate, we have a good value.
      if ((l.x === 0 && l.y === 0) || u - v < mrt) retVal = set(Vector.create(), l);
      else {
        iter++;
        // Find a new support to refine the portal.
        let c = support(A, B, l);
        let result = smallestTranslation(viewPoint, portal.a, portal.b, c);
        if (result[0] === sAShortest)
          portal.b = c;
        else 
          portal.a = c;
        set(l, result[1]);
        u = v;
      }
    }
  }
  return [retVal, portal, iter];
}

export { Portal, mpr, mtv };