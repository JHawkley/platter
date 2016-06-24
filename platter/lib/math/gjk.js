define(['exports', '../math/vector', '../geom/simplex'], function (exports, _mathVector, _geomSimplex) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_mathVector);

  var _Simplex = _interopRequireDefault(_geomSimplex);

  var containsOrigin, gjk, support, tripleProduct;

  support = function (A, B, v) {
    var d, p1, p2;
    d = v.asMutable();
    p1 = A.support(d);
    p2 = B.support(d.mulEq(-1));
    p1.subEq(p2);
    p2.release();
    d.release();
    return p1;
  };

  tripleProduct = function (a, b, c) {
    var bac, cab;
    bac = b.mul(a.dot(c));
    cab = c.mul(a.dot(b));
    bac.subEq(cab);
    cab.release();
    return bac;
  };

  containsOrigin = function (simplex, d) {
    var a, ab, abPerp, ac, acPerp, ao, b, c, retVal;
    retVal = false;
    a = simplex.a, b = simplex.b;
    ao = a.mul(-1);
    ab = b.sub(a);
    if (simplex.points.length === 3) {
      c = simplex.c;
      ac = c.sub(a);
      abPerp = tripleProduct(ac, ab, ab);
      if (abPerp.dot(ao) > 0) {
        simplex.removeC();
        d.set(abPerp);
      } else {
        acPerp = tripleProduct(ab, ac, ac);
        if (acPerp.dot(ao) > 0) {
          simplex.removeB();
          d.set(acPerp);
        } else {
          retVal = true;
        }
        acPerp.release();
      }
      ac.release();
    } else {
      abPerp = tripleProduct(ab, ao, ab);
      d.set(abPerp);
    }
    ao.release();
    ab.release();
    abPerp.release();
    return retVal;
  };

  gjk = function (A, B) {
    var ca, cb, d, retVal, simplex;
    ca = A.getCenter();
    cb = B.getCenter();
    d = cb.subEq(ca);
    ca.release();
    simplex = _Simplex['default'].create(support(A, B, d));
    d.mulEq(-1);
    retVal = false;
    while (true) {
      simplex.add(support(A, B, d));
      if (simplex.a.dot(d) <= 0) {
        retVal = false;
        break;
      }
      if (containsOrigin(simplex, d)) {
        retVal = true;
        break;
      }
    }
    d.release();
    simplex.release();
    return retVal;
  };
});
