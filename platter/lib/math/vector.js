define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var ImmutableVector,
      SimpleVector,
      Vector,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  exports.MutableVector = Vector = (function () {
    Vector.init = function (instance, x, y) {
      var _data;
      _data = instance._data;
      _data.x = x != null ? x : 0;
      _data.y = y != null ? y : 0;
      return instance.validate();
    };

    Vector.create = function (x, y) {
      return new Vector(x, y);
    };

    Vector.reclaim = function (obj) {};

    Vector.prototype.release = function () {
      return Vector.reclaim(this);
    };

    Object.defineProperty(Vector.prototype, 'x', {
      get: function get() {
        return this._data.x;
      },
      set: function set(val) {
        this._data.x = val;
        return this.validate();
      },
      enumerable: true
    });

    Object.defineProperty(Vector.prototype, 'y', {
      get: function get() {
        return this._data.y;
      },
      set: function set(val) {
        this._data.y = val;
        return this.validate();
      },
      enumerable: true
    });

    Object.defineProperty(Vector.prototype, 'length', {
      get: function get() {
        return this._data.length;
      },
      set: function set(val) {
        var _data, scalar;
        _data = this._data;
        switch (false) {
          case !(val < 0):
            throw new Error('length must not be less than 0');
            break;
          case val !== 0:
            _data.x = 0;
            _data.y = 0;
            break;
          case !(_data.x === 0 && _data.y === 0):
            _data.y = val;
            break;
          default:
            scalar = val / _data.length;
            _data.x *= scalar;
            _data.y *= scalar;
        }
        return this.validate();
      },
      enumerable: true
    });

    Object.defineProperty(Vector.prototype, 'angle', {
      get: function get() {
        return this._data.angle;
      },
      set: function set(a) {
        return this.rotateSelf(a - this._data.angle);
      },
      enumerable: true
    });

    function Vector(x, y) {
      this._data = {};
      Vector.init(this, x, y);
    }

    Vector.prototype.validate = function () {
      var _data, x, y;
      _data = this._data;
      x = _data.x, y = _data.y;
      _data.length = Math.sqrt(x * x + y * y);
      return _data.angle = Math.atan2(x, y);
    };

    Vector.prototype.add = function (op) {
      return this.constructor.create(this._data.x + op.x, this._data.y + op.y);
    };

    Vector.prototype.sub = function (op) {
      return this.constructor.create(this._data.x - op.x, this._data.y - op.y);
    };

    Vector.prototype.mul = function (scalar) {
      return this.constructor.create(this._data.x * scalar, this._data.y * scalar);
    };

    Vector.prototype.rotate = function (ra) {
      var ax, ay, x, y;
      x = this._data.x;
      y = this._data.y;
      ra *= -1;
      ax = Math.sin(ra);
      ay = Math.cos(ra);
      return this.constructor.create(x * ay - y * ax, x * ax + y * ay);
    };

    Vector.prototype.unit = function () {
      var l;
      l = this._data.length;
      return this.constructor.create(this._data.x / l, this._data.y / l);
    };

    Vector.prototype.addEq = function (op) {
      this._data.x += op.x;
      this._data.y += op.y;
      this.validate();
      return this;
    };

    Vector.prototype.subEq = function (op) {
      this._data.x -= op.x;
      this._data.y -= op.y;
      this.validate();
      return this;
    };

    Vector.prototype.mulEq = function (scalar) {
      this._data.x *= scalar;
      this._data.y *= scalar;
      this.validate();
      return this;
    };

    Vector.prototype.set = function (other) {
      this._data.x = other.x;
      this._data.y = other.y;
      this.validate();
      return this;
    };

    Vector.prototype.setXY = function (x, y) {
      this._data.x = x;
      this._data.y = y;
      this.validate();
      return this;
    };

    Vector.prototype.rotateSelf = function (ra) {
      var _data, ax, ay, x, y;
      _data = this._data;
      x = _data.x, y = _data.y;
      ra *= -1;
      ax = Math.sin(ra);
      ay = Math.cos(ra);
      _data.x = x * ay - y * ax;
      _data.y = x * ax + y * ay;
      this.validate();
      return this;
    };

    Vector.prototype.copy = function () {
      return Vector.create(this._data.x, this._data.y);
    };

    Vector.prototype.asMutable = function () {
      return Vector.create(this._data.x, this._data.y);
    };

    Vector.prototype.asImmutable = function () {
      return ImmutableVector.create(this._data.x, this._data.y);
    };

    Vector.prototype.toString = function () {
      return 'Platter.math.MutableVector({x: ' + this._data.x + ', y: ' + this._data.y + '})';
    };

    return Vector;
  })();

  exports.ImmutableVector = ImmutableVector = (function (superClass) {
    extend(ImmutableVector, superClass);

    ImmutableVector.create = function (x, y) {
      return new ImmutableVector(x, y);
    };

    ImmutableVector.reclaim = function () {};

    ImmutableVector.prototype.release = function () {};

    function ImmutableVector(x, y) {
      ImmutableVector.__super__.constructor.call(this, x, y);
      Object.freeze(this._data);
    }

    ImmutableVector.prototype.copy = function () {
      return this;
    };

    ImmutableVector.prototype.asImmutable = function () {
      return this;
    };

    ImmutableVector.prototype.addEq = function () {
      throw new Error('vector is immutable');
    };

    ImmutableVector.prototype.subEq = function () {
      throw new Error('vector is immutable');
    };

    ImmutableVector.prototype.mulEq = function () {
      throw new Error('vector is immutable');
    };

    ImmutableVector.prototype.set = function () {
      throw new Error('vector is immutable');
    };

    ImmutableVector.prototype.setXY = function () {
      throw new Error('vector is immutable');
    };

    ImmutableVector.prototype.rotateSelf = function () {
      throw new Error('vector is immutable');
    };

    ImmutableVector.prototype.toString = function () {
      return 'Platter.math.ImmutableVector({x: ' + this._data.x + ', y: ' + this._data.y + '})';
    };

    return ImmutableVector;
  })(Vector);

  exports.SimpleVector = SimpleVector = (function () {
    function SimpleVector(x1, y1) {
      this.x = x1;
      this.y = y1;
      Object.freeze(this);
    }

    SimpleVector.prototype.asMutable = function () {
      return Vector.create(this.x, this.y);
    };

    SimpleVector.prototype.asImmutable = function () {
      return ImmutableVector.create(this.x, this.y);
    };

    SimpleVector.prototype.toString = function () {
      return 'Platter.math.SimpleVector({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return SimpleVector;
  })();

  exports.MutableVector = Vector;
  exports.ImmutableVector = ImmutableVector;
  exports.SimpleVector = SimpleVector;
  exports['default'] = Vector;
});
