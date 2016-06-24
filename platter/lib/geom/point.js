define(['exports', '../factory/base', './primative', '../space/node', '../math/vector', '../math/vector-math', './_support', './_type', '../phys/proxy-point'], function (exports, _factoryBase, _primative, _spaceNode, _mathVector, _mathVectorMath, _support, _type, _physProxyPoint) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Primative = _interopRequireDefault(_primative);

  var _PointProxy = _interopRequireDefault(_physProxyPoint);

  var k,
      methods,
      pointFactory,
      v,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  pointFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.support = function (out, v) {
      return (0, _support.point)(out, this, v);
    };

    _Class.prototype.centerOf = function (out) {
      return (0, _mathVectorMath.set)(out, this);
    };

    _Class.prototype.makeProxy = function () {
      return _PointProxy['default'].create(this);
    };

    _Class.prototype.toRect = function (out) {
      out.set(this._data.rect);
      return out;
    };

    _Class.prototype.toString = function () {
      return "Platter.geom.Point#" + this.id + "({x: " + this.x + ", y: " + this.y + "})";
    };

    return _Class;
  })(_Primative['default']));

  exports.methods = methods = {
    rectangle: {
      finalize: function finalize() {
        return this.rect = {
          x: this.x,
          y: this.y,
          width: 0,
          height: 0
        };
      },
      seal: function seal() {
        return Object.freeze(this.rect);
      }
    },
    typeGroup: {
      finalize: function finalize() {
        return this.type.push(_type.point);
      }
    }
  };

  for (k in _spaceNode.methods) {
    v = _spaceNode.methods[k];
    pointFactory.method(k, v);
  }

  for (k in _primative.methods) {
    v = _primative.methods[k];
    pointFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    pointFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = _type.point;
  exports['default'] = pointFactory;
});
