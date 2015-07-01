define(['exports', 'module', './vector', '../utils/tolerant-compare'], function (exports, module, _vector, _utilsTolerantCompare) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_vector);

  var _q = _interopRequireDefault(_utilsTolerantCompare);

  var Matrix, wm, wv1, wv2, wv3;

  wv1 = new _Vector['default'](0, 0);

  wv2 = new _Vector['default'](0, 0);

  wv3 = new _Vector['default'](0, 0);

  wm = null;

  Matrix = (function () {
    Object.defineProperty(Matrix.prototype, 'determinant', {
      get: function get() {
        return this.a * this.d - this.b * this.c;
      }
    });

    Object.defineProperty(Matrix.prototype, 'isInvertible', {
      get: function get() {
        return !(0, _q['default'])(this.determinant, 0);
      }
    });

    Object.defineProperty(Matrix.prototype, 'isIdentity', {
      get: function get() {
        return (0, _q['default'])(this.a, 1) && (0, _q['default'])(this.b, 0) && (0, _q['default'])(this.c, 0) && (0, _q['default'])(this.d, 1) && (0, _q['default'])(this.e, 0) && (0, _q['default'])(this.f, 0);
      }
    });

    Object.defineProperty(Matrix.prototype, 'isValid', {
      get: function get() {
        return !(0, _q['default'])(this.a * this.d, 0);
      }
    });

    function Matrix() {
      this.a = this.d = 1;
      this.b = this.c = this.e = this.f = 0;
    }

    Matrix.prototype.concat = function (cm) {
      return this.transform(cm.a, cm.b, cm.c, cm.d, cm.e, cm.f);
    };

    Matrix.prototype.flipX = function () {
      return this.transform(-1, 0, 0, 1, 0, 0);
    };

    Matrix.prototype.flipY = function () {
      return this.transform(1, 0, 0, -1, 0, 0);
    };

    Matrix.prototype.reflectVector = function (v) {
      var d;
      this.applyToPoint(wv1.set(0, 1));
      d = 2 * (wv1.x * v.x + wv1.y * v.y);
      v.x -= d * wv1.x;
      v.y -= d * wv1.y;
      return v;
    };

    Matrix.prototype.reset = function () {
      return this.setTransform(1, 0, 0, 1, 0, 0);
    };

    Matrix.prototype.rotate = function (angle) {
      var cos, sin;
      cos = Math.cos(angle);
      sin = Math.sin(angle);
      return this.transform(cos, sin, -sin, cos, 0, 0);
    };

    Matrix.prototype.rotateFromVector = function (v) {
      return this.rotate(Math.atan2(v.y, v.x));
    };

    Matrix.prototype.rotateDeg = function (angle) {
      return this.rotate(angle * Math.PI / 180);
    };

    Matrix.prototype.scale = function (sx, sy) {
      return this.transform(sx, 0, 0, sy, 0, 0);
    };

    Matrix.prototype.scaleU = function (f) {
      return this.scale(f, f);
    };

    Matrix.prototype.scaleX = function (sx) {
      return this.scale(sx, 1);
    };

    Matrix.prototype.scaleY = function (sy) {
      return this.scale(1, sy);
    };

    Matrix.prototype.shear = function (sx, sy) {
      return this.transform(1, sy, sx, 1, 0, 0);
    };

    Matrix.prototype.shearX = function (sx) {
      return this.shear(sx, 0);
    };

    Matrix.prototype.shearY = function (sy) {
      return this.shear(0, sy);
    };

    Matrix.prototype.skew = function (ax, ay) {
      return this.shear(Math.tan(ax), Math.tan(ay));
    };

    Matrix.prototype.skewX = function (ax) {
      return this.shearX(Math.tan(ax));
    };

    Matrix.prototype.skewY = function (ay) {
      return this.shearY(Math.tan(ay));
    };

    Matrix.prototype.setTransform = function (a3, b3, c3, d3, e3, f3) {
      this.a = a3;
      this.b = b3;
      this.c = c3;
      this.d = d3;
      this.e = e3;
      this.f = f3;
      return this;
    };

    Matrix.prototype.translate = function (tx, ty) {
      return this.transform(1, 0, 0, 1, tx, ty);
    };

    Matrix.prototype.translateX = function (tx) {
      return this.translate(tx, 0);
    };

    Matrix.prototype.translateY = function (ty) {
      return this.translate(0, ty);
    };

    Matrix.prototype.transform = function (a2, b2, c2, d2, e2, f2) {
      var a1, b1, c1, d1, e1, f1;
      a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;
      this.a = a1 * a2 + c1 * b2;
      this.b = b1 * a2 + d1 * b2;
      this.c = a1 * c2 + c1 * d2;
      this.d = b1 * c2 + d1 * d2;
      this.e = a1 * e2 + c1 * f2 + e1;
      this.f = b1 * e2 + d1 * f2 + f1;
      return this;
    };

    Matrix.prototype.divide = function (m) {
      var im;
      if (!m.isInvertible) {
        throw new Error('divisor matrix is not invertible');
      }
      im = m.copyTo(wm).inverse();
      return this.transform(im.a, im.b, im.c, im.d, im.e, im.f);
    };

    Matrix.prototype.divideScalar = function (d) {
      this.a /= d;
      this.b /= d;
      this.c /= d;
      this.d /= d;
      this.e /= d;
      this.f /= d;
      return this;
    };

    Matrix.prototype.inverse = function () {
      var a, b, c, d, dt, e, f;
      switch (false) {
        case !this.isIdentity:
          return this;
        case !!this.isInvertible:
          throw new Error('matrix is not invertible');
          break;
        default:
          a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f;
          dt = a * d - b * c;
          this.a = d / dt;
          this.b = -b / dt;
          this.c = -c / dt;
          this.d = a / dt;
          this.e = (c * f - d * e) / dt;
          this.f = -(a * f - b * e) / dt;
          return this;
      }
    };

    Matrix.prototype.interpolate = function (m2, t) {
      var m;
      m = new Matrix();
      m.a = this.a + (m2.a - this.a) * t;
      m.b = this.b + (m2.b - this.b) * t;
      m.c = this.c + (m2.c - this.c) * t;
      m.d = this.d + (m2.d - this.d) * t;
      m.e = this.e + (m2.e - this.e) * t;
      m.f = this.f + (m2.f - this.f) * t;
      return m;
    };

    Matrix.prototype.interpolateAnim = function (m2, t) {
      var d1, d2, m, rotation, scaleX, scaleY, translateX, translateY;
      m = new Matrix();
      d1 = this.decompose();
      d2 = m2.decompose();
      rotation = d1.rotation + (d2.rotation - d1.rotation) * t;
      translateX = d1.translate.x + (d2.translate.x - d1.translate.x) * t;
      translateY = d1.translate.y + (d2.translate.y - d1.translate.y) * t;
      scaleX = d1.scale.x + (d2.scale.x - d1.scale.x) * t;
      scaleY = d1.scale.y + (d2.scale.y - d1.scale.y) * t;
      m.translate(translateX, translateY);
      m.rotate(rotation);
      m.scale(scaleX, scaleY);
      return m;
    };

    Matrix.prototype.decompose = function (useLU) {
      if (useLU == null) {
        useLU = false;
      }
      if (useLU) {
        return this.decomposeLU();
      } else {
        return this.decomposeQR();
      }
    };

    Matrix.prototype.decomposeLU = function () {
      var PI, a, atan, b, c, d, determ, rotation, scale, skew, translate;
      a = this.a, b = this.b, c = this.c, d = this.d;
      atan = Math.atan, PI = Math.PI;
      translate = wv1.set(this.e, this.f);
      scale = wv2.set(1, 1);
      skew = wv3.set(0, 0);
      rotation = 0;
      determ = a * d - b * c;
      switch (false) {
        case !a:
          skew.set(atan(c / a), atan(b / a));
          scale.set(a, determ / a);
          break;
        case !b:
          rotation = PI * 0.5;
          scale.set(b, determ / b);
          skew.x = atan(d / b);
          break;
        default:
          scale.set(c, d);
          skew.x = PI * 0.25;
      }
      return {
        translate: translate.clone(),
        scale: scale.clone(),
        skew: skew.clone(),
        rotation: rotation
      };
    };

    Matrix.prototype.decomposeQR = function () {
      var PI, a, acos, atan, b, c, d, determ, r, rotation, s, scale, skew, sqrt, translate;
      a = this.a, b = this.b, c = this.c, d = this.d;
      acos = Math.acos, atan = Math.atan, sqrt = Math.sqrt, PI = Math.PI;
      translate = wv1.set(this.e, this.f);
      scale = wv2.set(1, 1);
      skew = wv3.set(0, 0);
      rotation = 0;
      determ = a * d - b * c;
      switch (false) {
        case !a:
        case !b:
          r = sqrt(a * a + b * b);
          rotation = b > 0 ? acos(a / r) : -acos(a / r);
          scale.set(r, determ / r);
          skew.x = atan((a * c + b * d) / (r * r));
          break;
        case !c:
        case !d:
          s = sqrt(c * c + d * d);
          rotation = PI * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
          scale.set(determ / s, s);
          skew.y = atan((a * c + b * d) / (s * s));
          break;
        default:
          scale.set(0, 0);
      }
      return {
        translate: translate.clone(),
        scale: scale.clone(),
        skew: skew.clone(),
        rotation: rotation
      };
    };

    Matrix.prototype.applyToPoint = function (pt) {
      var x, y;
      x = pt.x, y = pt.y;
      pt.x = x * this.a + y * this.c + this.e;
      pt.y = x * this.b + y * this.d + this.f;
      return pt;
    };

    Matrix.prototype.applyToArray = function (points) {
      var i, len, point;
      for (i = 0, len = points.length; i < len; i++) {
        point = points[i];
        this.applyToPoint(point);
      }
      return points;
    };

    Matrix.prototype.applyToPoly = function (poly) {
      this.applyToArray(poly.points);
      return poly;
    };

    Matrix.prototype.copyTo = function (m) {
      return m.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
    };

    Matrix.prototype.clone = function () {
      return this.copyTo(new Matrix());
    };

    Matrix.prototype.isEqual = function (m) {
      return (0, _q['default'])(this.a, m.a) && (0, _q['default'])(this.b, m.b) && (0, _q['default'])(this.c, m.c) && (0, _q['default'])(this.d, m.d) && (0, _q['default'])(this.e, m.e) && (0, _q['default'])(this.f, m.f);
    };

    Matrix.prototype.toArray = function () {
      return [this.a, this.b, this.c, this.d, this.e, this.f];
    };

    Matrix.prototype.toCSS = function () {
      return 'matrix(' + this.toArray().join(', ') + ')';
    };

    Matrix.prototype.toJSON = function () {
      return {
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      };
    };

    Matrix.prototype.toString = function () {
      return 'Matrix({a: ' + this.a + ', b: ' + this.b + ', c: ' + this.c + ', d: ' + this.d + ', e: ' + this.e + ', f: ' + this.f + '})';
    };

    return Matrix;
  })();

  wm = new Matrix();

  module.exports = Matrix;
});
