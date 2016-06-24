define(['exports', 'module', './vector', './vector-math'], function (exports, module, _vector, _vectorMath) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_vector);

  var InterpolationNode, VectorInterpolation, map, workingVector, zeroVector;

  zeroVector = _vector.ImmutableVector.create(0, 0);

  workingVector = _Vector['default'].create(0, 0);

  map = function (out, nStart, nStop, vMin, vMax, n) {
    var s, x, y;
    s = (n - nStart) / (nStop - nStart);
    x = vMin.x + (vMax.x - vMin.x) * s;
    y = vMin.y + (vMax.y - vMin.y) * s;
    (0, _vectorMath.setXY)(out, x, y);
    return out;
  };

  InterpolationNode = (function () {
    var pool;

    pool = [];

    InterpolationNode.init = function (instance, pos, value) {
      if (!(0 <= pos && pos <= 1)) {
        throw new Error('out of range');
      }
      if (value == null) {
        throw new Error('null reference');
      }
      instance.pos = pos;
      return instance.value = value.copy();
    };

    InterpolationNode.create = function (pos, value) {
      var instance, ref;
      instance = (ref = pool.pop()) != null ? ref : new InterpolationNode();
      InterpolationNode.init(instance, pos, value);
      return instance;
    };

    InterpolationNode.reclaim = function (obj) {
      obj.value.release();
      obj.value = null;
      return pool.push(obj);
    };

    InterpolationNode.prototype.release = function () {
      return InterpolationNode.reclaim(this);
    };

    InterpolationNode.comparer = function (a, b) {
      return a.pos - b.pos;
    };

    function InterpolationNode() {
      this.pos = 0.0;
      this.value = zeroVector;
    }

    return InterpolationNode;
  })();

  VectorInterpolation = (function () {
    function VectorInterpolation() {
      this.nodes = [];
    }

    VectorInterpolation.prototype.valueAt = function (out, pos) {
      var cPos, cValue, i, lPos, lValue, len, node, nodes;
      nodes = this.nodes;
      if (nodes.length === 0) {
        (0, _vectorMath.set)(out, zeroVector);
      } else if (pos <= 0.0) {
        node = nodes[0];
        (0, _vectorMath.set)(out, node.pos === 0.0 ? node.value : zeroVector);
      } else {
        node = nodes[nodes.length - 1];
        if (pos >= 1.0 || pos >= node.pos) {
          (0, _vectorMath.set)(out, node.value);
        } else {
          lPos = 0.0;
          lValue = zeroVector;
          for (i = 0, len = nodes.length; i < len; i++) {
            node = nodes[i];
            cPos = node.pos, cValue = node.value;
            if (cPos === lPos) {
              if (pos === cPos) {
                (0, _vectorMath.set)(out, cValue);
                break;
              }
            } else if (lPos < pos && pos <= cPos) {
              map(out, lPos, cPos, lValue, cValue, pos);
              break;
            }
            lPos = cPos;
            lValue = cValue;
          }
        }
      }
      return out;
    };

    VectorInterpolation.prototype.add = function (value, pos) {
      var nodes;
      if (pos == null) {
        pos = 1.0;
      }
      nodes = this.nodes;
      nodes.push(InterpolationNode.create(pos, value));
      nodes.sort(InterpolationNode.comparer);
      return this;
    };

    VectorInterpolation.prototype.set = function (value) {
      if (this.nodes.length > 0) {
        this.clear();
      }
      return this.add(value, 1.0);
    };

    VectorInterpolation.prototype.divert = function (pos, value) {
      if (pos >= 1.0) {
        return this.set(value);
      } else {
        this.valueAt(workingVector, pos);
        this.set(value);
        return this.add(workingVector, pos);
      }
    };

    VectorInterpolation.prototype.clear = function () {
      var i, len, node, nodes;
      nodes = this.nodes;
      for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        node.release();
      }
      nodes.length = 0;
      return this;
    };

    return VectorInterpolation;
  })();

  module.exports = VectorInterpolation;
});
