define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var add, angle, cross, dot, length, makeLength, mul, rotate, set, setXY, sub, unit;

  exports.set = set = function (out, op) {
    out.x = op.x;
    out.y = op.y;
    return out;
  };

  exports.setXY = setXY = function (out, x, y) {
    out.x = x;
    out.y = y;
    return out;
  };

  exports.add = add = function (out, a, b) {
    return setXY(out, a.x + b.x, a.y + b.y);
  };

  exports.sub = sub = function (out, a, b) {
    return setXY(out, a.x - b.x, a.y - b.y);
  };

  exports.mul = mul = function (out, op, s) {
    return setXY(out, op.x * s, op.y * s);
  };

  exports.length = length = function (op) {
    var x, y;
    x = op.x, y = op.y;
    return Math.sqrt(x * x + y * y);
  };

  exports.makeLength = makeLength = function (out, op, len) {
    switch (false) {
      case !(len < 0):
        throw new Error('length must not be less than 0');
        break;
      case len !== 0:
        return setXY(out, 0, 0);
      case !(op.x === 0 && op.y === 0):
        return setXY(out, 0, len);
      default:
        return mul(out, op, len / length(op));
    }
  };

  exports.angle = angle = function (op) {
    return Math.atan2(op.x, op.y);
  };

  exports.rotate = rotate = function (out, op, ra) {
    var ax, ay, x, y;
    x = op.x;
    y = op.y;
    ra *= -1;
    ax = Math.sin(ra);
    ay = Math.cos(ra);
    return setXY(out, x * ay - y * ax, x * ax + y * ay);
  };

  exports.unit = unit = function (out, op) {
    var il, x, y;
    if (op.x === 0 && op.y === 0) {
      x = 0;
      y = 0;
    } else {
      il = 1 / length(op);
      x = op.x * il;
      y = op.y * il;
    }
    return setXY(out, x, y);
  };

  exports.dot = dot = function (a, b) {
    return a.x * b.x + a.y * b.y;
  };

  exports.cross = cross = function (a, b) {
    return a.x * b.y - a.y * b.x;
  };

  exports.set = set;
  exports.setXY = setXY;
  exports.add = add;
  exports.sub = sub;
  exports.mul = mul;
  exports.length = length;
  exports.makeLength = makeLength;
  exports.angle = angle;
  exports.rotate = rotate;
  exports.unit = unit;
  exports.dot = dot;
  exports.cross = cross;
});
