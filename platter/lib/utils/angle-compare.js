define(['exports', './tolerant-compare'], function (exports, _tolerantCompare) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _q = _interopRequireDefault(_tolerantCompare);

  var compareAngle_Deg,
      compareAngle_Rad,
      normalizeAngle_Deg,
      normalizeAngle_Rad,
      pi2,
      modulo = function modulo(a, b) {
    return (+a % (b = +b) + b) % b;
  };

  pi2 = Math.PI * 2;

  normalizeAngle_Deg = function (input) {
    return modulo(input, 360);
  };

  normalizeAngle_Rad = function (input) {
    return modulo(input, pi2);
  };

  exports.compareAngleDegrees = compareAngle_Deg = function (a, b) {
    if (!(0 <= a && a < 360)) {
      a = normalizeAngle_Deg(a);
    }
    if (!(0 <= b && b < 360)) {
      b = normalizeAngle_Deg(b);
    }
    return (0, _q['default'])(a, b);
  };

  exports.compareAngleRadians = compareAngle_Rad = function (a, b) {
    if (!(0 <= a && a < pi2)) {
      a = normalizeAngle_Rad(a);
    }
    if (!(0 <= b && b < pi2)) {
      b = normalizeAngle_Rad(b);
    }
    return (0, _q['default'])(a, b);
  };

  exports.compareAngleDegrees = compareAngle_Deg;
  exports.compareAngleRadians = compareAngle_Rad;
  exports['default'] = compareAngle_Rad;
});
