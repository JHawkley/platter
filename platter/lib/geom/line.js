define(['exports', '../factory/base', './primative', '../space/node', '../math/vector', '../math/vector-math', './_support', './_type'], function (exports, _factoryBase, _primative, _spaceNode, _mathVector, _mathVectorMath, _support, _type) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Primative = _interopRequireDefault(_primative);

  var k,
      lineFactory,
      methods,
      v,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  lineFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    Object.defineProperty(_Class.prototype, 'point1', {
      get: function get() {
        return this._data.pt1;
      }
    });

    Object.defineProperty(_Class.prototype, 'point2', {
      get: function get() {
        return this._data.pt2;
      }
    });

    Object.defineProperty(_Class.prototype, 'normal', {
      get: function get() {
        return this._data.normal;
      }
    });

    Object.defineProperty(_Class.prototype, 'grade', {
      get: function get() {
        return this._data.grade;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.support = function (out, v) {
      return (0, _support.line)(out, this, v);
    };

    _Class.prototype.centerOf = function (out) {
      (0, _mathVectorMath.set)(out, this.point1);
      (0, _mathVectorMath.add)(out, out, this.point2);
      (0, _mathVectorMath.mul)(out, out, 0.5);
      return out;
    };

    _Class.prototype.toRect = function (out) {
      out.set(this._data.rect);
      return out;
    };

    _Class.prototype.toString = function () {
      var pt1, pt2;
      pt1 = "{x: " + this.point1.x + ", y: " + this.point1.y + "}";
      pt2 = "{x: " + this.point2.x + ", y: " + this.point2.y + "}";
      return "Platter.geom.Line#" + this.id + "(" + pt1 + ", " + pt2 + ")";
    };

    return _Class;
  })(_Primative['default']));

  exports.methods = methods = {
    from: {
      apply: function apply() {
        var ref, x, y;
        switch (arguments.length) {
          case 1:
            ref = arguments[0], x = ref.x, y = ref.y;
            break;
          case 2:
            x = arguments[0], y = arguments[1];
            break;
          default:
            throw new Error('invalid arguments');
        }
        return this.pt1 = {
          x: x,
          y: y
        };
      }
    },
    to: {
      apply: function apply(x, y) {
        var ref;
        switch (arguments.length) {
          case 1:
            ref = arguments[0], x = ref.x, y = ref.y;
            break;
          case 2:
            x = arguments[0], y = arguments[1];
            break;
          default:
            throw new Error('invalid arguments');
        }
        return this.pt2 = {
          x: x,
          y: y
        };
      }
    },
    points: {
      apply: function apply() {
        var ref, ref1, x1, x2, y1, y2;
        switch (arguments.length) {
          case 2:
            (ref = arguments[0], x1 = ref.x, y1 = ref.y), (ref1 = arguments[1], x2 = ref1.x, y2 = ref1.y);
            break;
          case 4:
            x1 = arguments[0], y1 = arguments[1], x2 = arguments[2], y2 = arguments[3];
            break;
          default:
            throw new Error('invalid arguments');
        }
        this.pt1 = {
          x: x1,
          y: y1
        };
        return this.pt2 = {
          x: x2,
          y: y2
        };
      },
      seal: function seal() {
        var offX, offY, ref, ref1, x1, x2, y1, y2;
        offX = this.x, offY = this.y, (ref = this.pt1, x1 = ref.x, y1 = ref.y), (ref1 = this.pt2, x2 = ref1.x, y2 = ref1.y);
        if (!(x1 != null && y1 != null && x2 != null && y2 != null)) {
          throw new Error('points for the line must be provided');
        }
        this.pt1 = new _mathVector.ImmutableVector(x1 + offX, y1 + offY);
        this.pt2 = new _mathVector.ImmutableVector(x2 + offX, y2 + offY);
        this.x = 0;
        return this.y = 0;
      }
    },
    normal: {
      finalize: function finalize() {
        var a, dx, dy, len, n, ref, ref1, x1, x2, y1, y2;
        (ref = this.pt1, x1 = ref.x, y1 = ref.y), (ref1 = this.pt2, x2 = ref1.x, y2 = ref1.y);
        dx = x2 - x1;
        dy = -(y2 - y1);
        len = Math.sqrt(dy * dy + dx * dx);
        this.normal = n = _mathVector.ImmutableVector.create(dy / len, dx / len);
        a = n.angle;
        if (a < 0) {
          a += Math.PI * 2;
        }
        return this.grade = (a + Math.PI) * -1;
      }
    },
    rectangle: {
      finalize: function finalize() {
        var offX, offY, ref, ref1, x1, x2, y1, y2;
        offX = this.x, offY = this.y, (ref = this.pt1, x1 = ref.x, y1 = ref.y), (ref1 = this.pt2, x2 = ref1.x, y2 = ref1.y);
        x1 += offX;
        y1 += offY;
        x2 += offX;
        y2 += offY;
        return this.rect = {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x1 - x2),
          height: Math.abs(y1 - y2)
        };
      },
      seal: function seal() {
        return Object.freeze(this.rect);
      }
    },
    typeGroup: {
      finalize: function finalize() {
        return this.type.push(_type.line);
      }
    }
  };

  for (k in _spaceNode.methods) {
    v = _spaceNode.methods[k];
    lineFactory.method(k, v);
  }

  for (k in _primative.methods) {
    v = _primative.methods[k];
    lineFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    lineFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = _type.line;
  exports['default'] = lineFactory;
});
