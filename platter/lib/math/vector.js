define(['exports', './vector-math'], function (exports, _vectorMath) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ImmutableVector,
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
      instance.x = x != null ? x : 0;
      return instance.y = y != null ? y : 0;
    };

    Vector.create = function (x, y) {
      return new Vector(x, y);
    };

    Vector.reclaim = function (obj) {};

    Vector.prototype.release = function () {
      return Vector.reclaim(this);
    };

    Object.defineProperty(Vector.prototype, 'length', {
      get: function get() {
        return (0, _vectorMath.length)(this);
      },
      set: function set(val) {
        return (0, _vectorMath.makeLength)(this, this, val);
      },
      enumerable: true
    });

    Object.defineProperty(Vector.prototype, 'angle', {
      get: function get() {
        return (0, _vectorMath.angle)(this);
      },
      set: function set(a) {
        return (0, _vectorMath.rotate)(this, this, a - (0, _vectorMath.angle)(this));
      },
      enumerable: true
    });

    function Vector(x, y) {
      Vector.init(this, x, y);
    }

    Vector.prototype.add = function (op) {
      return (0, _vectorMath.add)(Vector.create(), this, op);
    };

    Vector.prototype.sub = function (op) {
      return (0, _vectorMath.sub)(Vector.create(), this, op);
    };

    Vector.prototype.mul = function (scalar) {
      return (0, _vectorMath.mul)(Vector.create(), this, scalar);
    };

    Vector.prototype.rotate = function (ra) {
      return (0, _vectorMath.rotate)(Vector.create(), this, ra);
    };

    Vector.prototype.unit = function () {
      return (0, _vectorMath.unit)(Vector.create(), this);
    };

    Vector.prototype.dot = function (op) {
      return (0, _vectorMath.dot)(this, op);
    };

    Vector.prototype.cross = function (op) {
      return (0, _vectorMath.cross)(this, op);
    };

    Vector.prototype.addEq = function (op) {
      return (0, _vectorMath.add)(this, this, op);
    };

    Vector.prototype.subEq = function (op) {
      return (0, _vectorMath.sub)(this, this, op);
    };

    Vector.prototype.mulEq = function (scalar) {
      return (0, _vectorMath.mul)(this, this, scalar);
    };

    Vector.prototype.set = function (other) {
      return (0, _vectorMath.set)(this, other);
    };

    Vector.prototype.setXY = function (x, y) {
      return (0, _vectorMath.setXY)(this, x, y);
    };

    Vector.prototype.rotateSelf = function (ra) {
      return (0, _vectorMath.rotate)(this, this, ra);
    };

    Vector.prototype.copy = function () {
      return Vector.create(this.x, this.y);
    };

    Vector.prototype.asMutable = function () {
      return Vector.create(this.x, this.y);
    };

    Vector.prototype.asImmutable = function () {
      return ImmutableVector.create(this.x, this.y);
    };

    Vector.prototype.toString = function () {
      return "Platter.math.MutableVector({x: " + this.x + ", y: " + this.y + "})";
    };

    return Vector;
  })();

  exports.ImmutableVector = ImmutableVector = (function (superClass) {
    var spawn, wv;

    extend(ImmutableVector, superClass);

    wv = {
      x: 0,
      y: 0
    };

    spawn = function () {
      return ImmutableVector.create(wv.x, wv.y);
    };

    ImmutableVector.create = function (x, y) {
      return new ImmutableVector(x, y);
    };

    ImmutableVector.reclaim = function () {};

    ImmutableVector.prototype.release = function () {};

    function ImmutableVector(x, y) {
      ImmutableVector.__super__.constructor.call(this, x, y);
      Object.freeze(this);
    }

    ImmutableVector.prototype.copy = function () {
      return this;
    };

    ImmutableVector.prototype.asImmutable = function () {
      return this;
    };

    ImmutableVector.prototype.add = function (op) {
      (0, _vectorMath.add)(wv, this, op);
      return spawn();
    };

    ImmutableVector.prototype.sub = function (op) {
      (0, _vectorMath.sub)(wv, this, op);
      return spawn();
    };

    ImmutableVector.prototype.mul = function (scalar) {
      (0, _vectorMath.mul)(wv, this, scalar);
      return spawn();
    };

    ImmutableVector.prototype.rotate = function (ra) {
      (0, _vectorMath.rotate)(wv, this, ra);
      return spawn();
    };

    ImmutableVector.prototype.unit = function () {
      (0, _vectorMath.unit)(wv, this);
      return spawn();
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
      return "Platter.math.ImmutableVector({x: " + this.x + ", y: " + this.y + "})";
    };

    return ImmutableVector;
  })(Vector);

  exports.MutableVector = Vector;
  exports.ImmutableVector = ImmutableVector;
  exports['default'] = Vector;
});
