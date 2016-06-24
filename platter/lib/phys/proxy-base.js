define(['exports', 'module', '../math/vector', '../math/vector-math', '../space/_type'], function (exports, module, _mathVector, _mathVectorMath, _space_type) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_mathVector);

  var Proxy;

  Proxy = (function () {
    Proxy.init = function (instance, proxied) {
      return instance.proxied = proxied;
    };

    Object.defineProperty(Proxy.prototype, 'isKinematic', {
      get: function get() {
        return _space_type.kinematic.test(this.proxied.parent.type);
      }
    });

    Object.defineProperty(Proxy.prototype, 'x', {
      get: function get() {
        return this.syncPosition.x;
      }
    });

    Object.defineProperty(Proxy.prototype, 'y', {
      get: function get() {
        return this.syncPosition.y;
      }
    });

    Object.defineProperty(Proxy.prototype, 'delta', {
      get: function get() {
        return this.proxied.parent.delta;
      }
    });

    Object.defineProperty(Proxy.prototype, 'parent', {
      get: function get() {
        return this.proxied.parent;
      }
    });

    Object.defineProperty(Proxy.prototype, 'id', {
      get: function get() {
        return this.proxied.id;
      }
    });

    function Proxy() {
      this.proxied = null;
      this.oldPosition = _Vector['default'].create();
      this.syncPosition = _Vector['default'].create();
      this.collisions = {};
      this.lastCollision = null;
      this.island = null;
    }

    Proxy.prototype.transform = function () {
      throw new Error('not implemented');
    };

    Proxy.prototype.sync = function (time) {
      var offset;
      offset = this.delta.valueAt(_Vector['default'].create(), time);
      (0, _mathVectorMath.add)(this.syncPosition, this.oldPosition, offset);
      return offset.release();
    };

    Proxy.prototype.support = function (v) {
      throw new Error('not implemented');
    };

    Proxy.prototype.centerOf = function (out) {
      this.proxied.centerOf(out);
      (0, _mathVectorMath.add)(out, this.syncPosition);
      return out;
    };

    Proxy.prototype.addCollision = function (other) {};

    Proxy.prototype.getCollision = function (other) {
      return this.collisions[other.id];
    };

    Proxy.prototype.remCollision = function (other) {
      var coll;
      coll = this.collisions[other.id];
      other.remCollision(this);
      delete this.collisions[other.id];
      if (this.lastCollision === coll) {
        this.lastCollision = null;
      }
      coll.release();
    };

    Proxy.prototype.destroy = function () {
      var coll, k, ref;
      ref = this.collisions;
      for (k in ref) {
        coll = ref[k];
        this.remCollision(coll.getById(k));
      }
      this.lastCollision = null;
      return this.proxied = null;
    };

    Proxy.prototype.toRect = function (out, synced) {
      if (synced == null) {
        synced = false;
      }
      throw new Error('not implemented');
    };

    Proxy.prototype.toString = function () {
      return "Proxied::" + this.proxied.toString();
    };

    return Proxy;
  })();

  module.exports = Proxy;
});
