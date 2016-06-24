define(['exports', 'module', '../math/vector', '../utils/array'], function (exports, module, _mathVector, _utilsArray) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_mathVector);

  var Simplex;

  Simplex = (function () {
    Simplex.init = function (instance, a) {
      if (a != null) {
        return instance.points.push(a);
      }
    };

    Simplex.create = function (a) {
      return new Simplex(a);
    };

    Simplex.reclaim = function (obj) {
      var i, len, p, ref;
      ref = obj.points;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        p.release();
      }
      return obj.points.length = 0;
    };

    Simplex.prototype.release = function () {
      return Simplex.reclaim(this);
    };

    Object.defineProperty(Simplex.prototype, 'count', {
      get: function get() {
        return this.points.length;
      }
    });

    Object.defineProperty(Simplex.prototype, 'a', {
      get: function get() {
        return this.points[0];
      },
      set: function set(val) {
        var pt;
        pt = this.points[0];
        if (val !== pt) {
          pt.release();
          return this.points[0] = val;
        }
      }
    });

    Object.defineProperty(Simplex.prototype, 'b', {
      get: function get() {
        return this.points[1];
      },
      set: function set(val) {
        var pt;
        pt = this.points[1];
        if (val !== pt) {
          pt.release();
          return this.points[1] = val;
        }
      }
    });

    Object.defineProperty(Simplex.prototype, 'c', {
      get: function get() {
        return this.points[2];
      },
      set: function set(val) {
        var pt;
        pt = this.points[2];
        if (val !== pt) {
          pt.release();
          return this.points[2] = val;
        }
      }
    });

    function Simplex(a) {
      this.points = [];
      Simplex.init(this, a);
    }

    Simplex.prototype.copy = function () {
      var i, len, p, points, ref, retVal;
      retVal = Simplex.create();
      points = retVal.points;
      ref = this.points;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        points.push(p.copy());
      }
      return retVal;
    };

    Simplex.prototype.add = function (p) {
      this.points.unshift(p);
      return this;
    };

    Simplex.prototype.insert = function (obj, idx) {
      return (0, _utilsArray.insertAt)(this.points, obj, idx);
    };

    Simplex.prototype.removeA = function () {
      this.points.shift().release();
      return this;
    };

    Simplex.prototype.removeB = function () {
      this.points[1].release();
      (0, _utilsArray.removeAt)(this.points, 1);
      return this;
    };

    Simplex.prototype.removeC = function () {
      this.points[2].release();
      (0, _utilsArray.removeAt)(this.points, 2);
      return this;
    };

    return Simplex;
  })();

  module.exports = Simplex;
});
