import { MutableVector as Vector } from './vector';
import MinkowskiPoint from './minkowski-point';
import _Simplex from './simplex';
import VectorLike from '../types/vector-like';

type Simplex = _Simplex<MinkowskiPoint>;

interface ISupported {
  support<T extends VectorLike>(out: T, v: VectorLike): T;
  centerOf<T extends VectorLike>(out: T): T;
}

function support(A: ISupported, B: ISupported, v: Vector): MinkowskiPoint {
  let d = v.copy();
  let p1 = A.support(Vector.create(), d);
  let p2 = B.support(Vector.create(), d.mulEq(-1));
  
  let retVal = MinkowskiPoint.create(p1, p2);
  d.release(); p1.release(); p2.release();
  return retVal;
}

// A x (B x C)
function tripleProduct1(a: Vector, b: Vector, c: Vector): Vector {
  let bac = b.mul(a.dot(c));
  let cab = c.mul(a.dot(b));

  bac.subEq(cab);
  cab.release();
  return bac;
}

// (A x B) x C
function tripleProduct2(a: Vector, b: Vector, c: Vector): Vector {
  let acb = a.mul(-c.dot(b));
  let bca = b.mul(c.dot(a));

  acb.addEq(bca);
  bca.release();
  return acb;
}

function containsOrigin(out: Vector, simplex: Simplex): Boolean {
  let retVal = false, abPerp: Vector;
  let { a, b } = simplex;
  let ao = a.mul(-1);
  let ab = b.sub(a);

  if (simplex.count === 3) {
    let c = simplex.c;
    let ac = c.sub(a);

    abPerp = tripleProduct2(ac, ab, ab);
    if (abPerp.dot(ao) > 0) {
      simplex.removeC();
      out.set(abPerp);
    } else {
      let acPerp = tripleProduct2(ab, ac, ac);
      if (acPerp.dot(ao) > 0) {
        simplex.removeB();
        out.set(acPerp)
      } else {
        retVal = true;
      }
      acPerp.release();
    }
    ac.release();
  } else {
    abPerp = tripleProduct2(ab, ao, ab);
    out.set(abPerp);
  }

  ao.release(); ab.release(); abPerp.release();
  return retVal;
}

function gjk(A: ISupported, B: ISupported) {
  let ca = A.centerOf(Vector.create());
  let cb = B.centerOf(Vector.create());
  let d = cb.subEq(ca);
  // Can't release `cb`; it is now `d`.
  ca.release();

  let simplex: Simplex = _Simplex.create(support(A, B, d));
  d.mulEq(-1);

  let retVal: boolean | null = null;

  while(retVal === null) {
    simplex.add(support(A, B, d));
    if (simplex.a.dot(d) <= 0) {
      retVal = false;
    } else if (containsOrigin(d, simplex)) {
      retVal = true;
    }
  }

  // Releases `cb` as well.  `d` and `cb` are the same reference.
  d.release();
  simplex.release();

  return retVal;
}