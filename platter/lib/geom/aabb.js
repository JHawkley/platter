define(['exports', '../factory/base', './primative', '../space/node', '../math/vector', '../math/vector-math', './_support', './_type'], function (exports, _factoryBase, _primative, _spaceNode, _mathVector, _mathVectorMath, _support, _type) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Primative = _interopRequireDefault(_primative);

  var aabbFactory,
      k,
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

  aabbFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    Object.defineProperty(_Class.prototype, 'width', {
      get: function get() {
        return this._data.width;
      }
    });

    Object.defineProperty(_Class.prototype, 'height', {
      get: function get() {
        return this._data.height;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.support = function (out, v) {
      return (0, _support.aabb)(out, this, v);
    };

    _Class.prototype.centerOf = function (out) {
      return (0, _mathVectorMath.setXY)(out, this.x + this.width / 2, this.y + this.height / 2);
    };

    _Class.prototype.toRect = function (out) {
      out.set(this);
      return out;
    };

    _Class.prototype.toString = function () {
      var objRep;
      objRep = "{x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + "}";
      return "Platter.geom.AABB#" + this.id + "(" + objRep + ")";
    };

    return _Class;
  })(_Primative['default']));

  exports.methods = methods = {
    dimensions: {
      apply: function apply(width, height) {
        this.width = width;
        this.height = height;
      },
      finalize: function finalize() {
        if (!(this.width != null && this.height != null) || this.width <= 0 || this.height <= 0) {
          throw new Error('both dimensions must be provided');
        }
      }
    },
    width: {
      apply: function apply(width) {
        this.width = width;
      }
    },
    height: {
      apply: function apply(height) {
        this.height = height;
      }
    },
    typeGroup: {
      finalize: function finalize() {
        return this.type.push(_type.aabb);
      }
    }
  };

  for (k in _spaceNode.methods) {
    v = _spaceNode.methods[k];
    aabbFactory.method(k, v);
  }

  for (k in _primative.methods) {
    v = _primative.methods[k];
    aabbFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    aabbFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = aabbFactory;
});
