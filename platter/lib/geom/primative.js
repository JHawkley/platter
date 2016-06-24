define(['exports', '../space/node'], function (exports, _spaceNode) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Node = _interopRequireDefault(_spaceNode);

  var Primative,
      methods,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  Primative = (function (superClass) {
    extend(Primative, superClass);

    Primative.init = function (instance) {};

    Object.defineProperty(Primative.prototype, 'x', {
      get: function get() {
        var ref;
        return (ref = this._data.x) != null ? ref : 0;
      }
    });

    Object.defineProperty(Primative.prototype, 'y', {
      get: function get() {
        var ref;
        return (ref = this._data.y) != null ? ref : 0;
      }
    });

    Object.defineProperty(Primative.prototype, 'filter', {
      get: function get() {
        return this._data.filter;
      }
    });

    Object.defineProperty(Primative.prototype, 'proxy', {
      get: function get() {
        return this._proxy != null ? this._proxy : this._proxy = this.makeProxy();
      }
    });

    function Primative() {
      this._parent = null;
      this._proxy = null;
    }

    Primative.prototype.destroy = function () {
      Primative.__super__.destroy.call(this);
      if (this._proxy != null) {
        this._proxy.release();
        return this._proxy = null;
      }
    };

    Primative.prototype.support = function () {
      throw new Error('not implemented');
    };

    Primative.prototype.centerOf = function () {
      throw new Error('not implemented');
    };

    Primative.prototype.makeProxy = function () {
      throw new Error('not implemented');
    };

    Primative.prototype.toString = function () {
      return "Platter.geom.Primative#" + this.id + "({x: " + this.x + ", y: " + this.y + "})";
    };

    return Primative;
  })(_Node['default']);

  exports.methods = methods = {
    translate: {
      init: function init() {
        this.x = 0;
        return this.y = 0;
      },
      apply: function apply(x, y) {
        this.x += x;
        return this.y += y;
      }
    }
  };

  exports.methods = methods;
  exports['default'] = Primative;
});
