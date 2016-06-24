define(['exports', '../math/vector-math', '../utils/distance'], function (exports, _mathVectorMath, _utilsDistance) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _distance = _interopRequireDefault(_utilsDistance);

  var aabb, circle, line, point;

  exports.aabb = aabb = function (out, aabb, v) {
    var hHeight, hWidth, vx, vy;
    vx = v.x, vy = v.y;
    vx = (function () {
      switch (false) {
        case !(vx < 0):
          return -1;
        case !(vx > 0):
          return 1;
        default:
          return 0;
      }
    })();
    vy = (function () {
      switch (false) {
        case !(vy < 0):
          return -1;
        case !(vy > 0):
          return 1;
        default:
          return 0;
      }
    })();
    hWidth = aabb.width * 0.5;
    hHeight = aabb.height * 0.5;
    (0, _mathVectorMath.setXY)(out, vx * hWidth + aabb.x + hWidth, vy * hHeight + aabb.y + hHeight);
    return out;
  };

  exports.circle = circle = function (out, c, v) {
    (0, _mathVectorMath.set)(out, v);
    out.length = 1;
    (0, _mathVectorMath.mul)(out, out, c.radius);
    (0, _mathVectorMath.add)(out, out, c);
    return out;
  };

  exports.line = line = function (out, line, v) {
    var d1, d2, p1, p2;
    p1 = line.point1, p2 = line.point2;
    (0, _mathVectorMath.set)(out, p1);
    (0, _mathVectorMath.sub)(out, out, p2);
    d1 = (0, _distance['default'])(out, v);
    (0, _mathVectorMath.mul)(out, out, -1);
    d2 = (0, _distance['default'])(out, v);
    switch (false) {
      case d1 !== d2:
        (0, _mathVectorMath.set)(out, p1);
        (0, _mathVectorMath.add)(out, out, p2);
        (0, _mathVectorMath.mul)(out, out, 0.5);
        break;
      case !(d1 < d2):
        (0, _mathVectorMath.set)(out, p1);
        break;
      default:
        (0, _mathVectorMath.set)(out, p2);
    }
    return out;
  };

  exports.point = point = function (out, p, v) {
    return (0, _mathVectorMath.set)(out, p);
  };

  exports.aabb = aabb;
  exports.circle = circle;
  exports.line = line;
  exports.point = point;
});
