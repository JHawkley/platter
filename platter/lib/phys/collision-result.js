define(['exports', '../math/vector', '../geom/simplex', '../math/vector-math', '../utils/tolerant-compare', '../config'], function (exports, _mathVector, _geomSimplex, _mathVectorMath, _utilsTolerantCompare, _config) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_mathVector);

  var _Simplex = _interopRequireDefault(_geomSimplex);

  var _q = _interopRequireDefault(_utilsTolerantCompare);

  var _config2 = _interopRequireDefault(_config);

  var CollisionResult,
      MinkowskiPoint,
      containsOrigin,
      tripleProduct,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  MinkowskiPoint = (function (superClass) {
    extend(MinkowskiPoint, superClass);

    MinkowskiPoint.init = function (instance, A, B, v) {
      var _data, d, p1, p2;
      _data = instance._data;
      if (v != null) {
        d = v.asMutable();
        _data.s1 = p1 = A.support(d);
        _data.s2 = p2 = B.support((0, _mathVectorMath.mul)(d, d, -1));
        d.release();
      } else {
        _data.s1 = p1 = A.copy();
        _data.s2 = p2 = B.copy();
      }
      return _Vector['default'].init(instance, p1.x - p2.x, p1.y - p2.y);
    };

    MinkowskiPoint.create = function (shape1, shape2, v) {
      return new MinkowskiPoint(shape1, shape2, v);
    };

    MinkowskiPoint.reclaim = function (obj) {
      var _data;
      _data = obj._data;
      _data.s1.release();
      _data.s2.release();
      return _data.s1 = _data.s2 = null;
    };

    MinkowskiPoint.prototype.release = function () {
      return MinkowskiPoint.reclaim(this);
    };

    Object.defineProperty(MinkowskiPoint.prototype, 's1', {
      get: function get() {
        return this._data.s1;
      }
    });

    Object.defineProperty(MinkowskiPoint.prototype, 's2', {
      get: function get() {
        return this._data.s2;
      }
    });

    function MinkowskiPoint(shape1, shape2, v) {
      this._data = {
        s1: null,
        s2: null
      };
      MinkowskiPoint.init(this, shape1, shape2, v);
    }

    MinkowskiPoint.prototype.copy = function () {
      return MinkowskiPoint.create(this.s1, this.s2);
    };

    MinkowskiPoint.prototype.toString = function () {
      return "MinkowskiPoint({x: " + this.s1.x + " - " + this.s2.x + " = " + this.x + ", y: " + this.s1.y + " - " + this.s2.y + " = " + this.y + "})";
    };

    return MinkowskiPoint;
  })(_Vector['default']);

  tripleProduct = function (a, b, c) {
    var bac, cab;
    bac = (0, _mathVectorMath.mul)(_Vector['default'].create(), b, (0, _mathVectorMath.dot)(a, c));
    cab = (0, _mathVectorMath.mul)(_Vector['default'].create(), c, (0, _mathVectorMath.dot)(a, b));
    (0, _mathVectorMath.sub)(bac, bac, cab);
    cab.release();
    return bac;
  };

  containsOrigin = function (simplex, d) {
    var a, ab, abPerp, ac, acPerp, ao, b, c, retVal;
    retVal = false;
    a = simplex.a, b = simplex.b;
    ao = (0, _mathVectorMath.mul)(_Vector['default'].create(), a, -1);
    ab = (0, _mathVectorMath.sub)(_Vector['default'].create(), b, a);
    if (simplex.points.length === 3) {
      c = simplex.c;
      ac = (0, _mathVectorMath.sub)(_Vector['default'].create(), c, a);
      abPerp = tripleProduct(ac, ab, ab);
      if ((0, _mathVectorMath.dot)(abPerp, ao) > 0) {
        simplex.removeC();
        (0, _mathVectorMath.set)(d, abPerp);
      } else {
        acPerp = tripleProduct(ab, ac, ac);
        if ((0, _mathVectorMath.dot)(acPerp, ao) > 0) {
          simplex.removeB();
          (0, _mathVectorMath.set)(d, acPerp);
        } else {
          retVal = true;
        }
        acPerp.release();
      }
      ac.release();
    } else {
      abPerp = tripleProduct(ab, ao, ab);
      (0, _mathVectorMath.set)(d, abPerp);
    }
    ao.release();
    ab.release();
    abPerp.release();
    return retVal;
  };

  ({
    closestToOrigin: function closestToOrigin(a, b) {
      if (a.length < b.length) {
        return a;
      } else {
        return b;
      }
    }
  });

  CollisionResult = (function () {
    Object.defineProperty(CollisionResult.prototype, 'intersecting', {
      get: function get() {
        return this.testIntersecting();
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'colliding', {
      get: function get() {
        return this.testDistance() <= -_config2['default'].touchingTolerance;
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'normal', {
      get: function get() {
        return this.testNormal();
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'penetration', {
      get: function get() {
        return -this.testDistance();
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'mtv', {
      get: function get() {
        return this.testMTV();
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'distance', {
      get: function get() {
        return this.testDistance();
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'closestA', {
      get: function get() {
        return this.testClosest().closestA;
      }
    });

    Object.defineProperty(CollisionResult.prototype, 'closestB', {
      get: function get() {
        return this.testClosest().closestB;
      }
    });

    function CollisionResult(a, b) {
      this.shape1 = a;
      this.shape2 = b;
      this._data = {
        haveIntersection: false,
        haveMTV: false,
        haveDistance: false,
        haveClosest: false,
        intersecting: false,
        normal: _Vector['default'].create(),
        mtv: _Vector['default'].create(),
        distance: 0,
        closestA: null,
        closestB: null,
        simplex: null
      };
    }

    CollisionResult.prototype.invalidate = function () {
      var data, ref, ref1, ref2;
      data = this._data;
      data.haveIntersection = false;
      data.haveNormal = false;
      data.haveDistance = false;
      data.haveClosest = false;
      if ((ref = data.simplex) != null) {
        ref.release();
      }
      if ((ref1 = data.closestA) != null) {
        ref1.release();
      }
      if ((ref2 = data.closestB) != null) {
        ref2.release();
      }
      return data.simplex = data.closestA = data.closestB = null;
    };

    CollisionResult.prototype.support = function (v) {
      return MinkowskiPoint.create(this.shape1, this.shape2, v);
    };

    CollisionResult.prototype.testIntersecting = function () {
      var c1, c2, d, data, retVal, simplex;
      data = this._data;
      if (data.haveIntersection) {
        return data.intersecting;
      }
      c1 = this.shape1.getCenter();
      c2 = this.shape2.getCenter();
      d = (0, _mathVectorMath.sub)(c2, c2, c1);
      c1.release();
      data.simplex = simplex = _Simplex['default'].create(this.support(d));
      (0, _mathVectorMath.mul)(d, d, -1);
      retVal = false;
      while (true) {
        simplex.add(this.support(d));
        if ((0, _mathVectorMath.dot)(simplex.a, d) <= 0) {
          retVal = false;
          break;
        }
        if (containsOrigin(simplex, d)) {
          retVal = true;
          break;
        }
      }
      d.release();
      data.haveIntersection = true;
      return data.intersecting = retVal;
    };

    CollisionResult.prototype.testDistance = function () {
      var c, d, da, data, dc, len, p, simplex;
      data = this._data;
      if (data.haveDistance) {
        return data.distance;
      }
      simplex = data.simplex;
      if (this.testIntersecting()) {} else {
        if (simplex.length === 3) {
          simplex.removeC();
        }
        d = _Vector['default'].create();
        while (true) {
          p = closestToOrigin(simplex.a, simplex.b);
          len = p.length;
          if (len < _config2['default'].touchingTolerance) {
            data.distance = len;
            break;
          }
          (0, _mathVectorMath.mul)(d, p, -1);
          (0, _mathVectorMath.makeLength)(d, d, 1);
          c = this.support(d);
          dc = (0, _mathVectorMath.dot)(c, d);
          da = (0, _mathVectorMath.dot)(simplex.a, d);
          if (dc - da < _config2['default'].touchingTolerance) {
            c.release();
            data.distance = dc;
            break;
          }
          if (a.length < b.length) {
            simplex.b = c;
          } else {
            simplex.a = c;
          }
        }
        d.release();
      }
      data.haveDistance = true;
      return data.distance;
    };

    CollisionResult.prototype.testClosest = function () {
      var L, LdotA, LdotL, data, lambda1, lambda2, v1, v2;
      data = this._data;
      if (data.haveClosest || this.testIntersecting()) {
        return data;
      }
      this.testDistance();
      L = (0, _mathVectorMath.sub)(_Vector['default'].create(), simplex.b, simplex.a);
      if (L.length <= _config2['default'].touchingTolerance) {
        data.closestA = simplex.a.s1.copy();
        data.closestB = simplex.a.s2.copy();
        L.release();
        return data;
      }
      LdotL = (0, _mathVectorMath.dot)(L, L);
      LdotA = (0, _mathVectorMath.dot)(simplex.a, L);
      lambda1 = -LdotA / LdotL;
      lambda2 = 1 - lambda1;
      if (lambda1 < 0) {
        data.closestA = simplex.b.s1.copy();
        data.closestB = simplex.b.s2.copy();
      } else if (lambda2 < 0) {
        data.closestA = simplex.a.s1.copy();
        data.closestB = simplex.a.s2.copy();
      } else {
        v1 = _Vector['default'].create();
        v2 = _Vector['default'].create();
        (0, _mathVectorMath.mul)(v1, simplex.a.s1, lambda1);
        (0, _mathVectorMath.mul)(v2, simplex.b.s1, lambda2);
        data.closestA = (0, _mathVectorMath.add)(_Vector['default'].create(), v1, v2);
        (0, _mathVectorMath.mul)(v1, simplex.a.s2, lambda1);
        (0, _mathVectorMath.mul)(v2, simplex.b.s2, lambda2);
        data.closestB = (0, _mathVectorMath.add)(_Vector['default'].create(), v1, v2);
        v1.release();
        v2.release();
      }
      L.release();
      return data;
    };

    return CollisionResult;
  })();
});
