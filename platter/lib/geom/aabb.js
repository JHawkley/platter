define(['exports', '../factory/base', '../space/node', './primative'], function (exports, _factoryBase, _spaceNode, _primative) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_spaceNode);

  var _Primative = _interopRequireDefault(_primative);

  var aabbFactory,
      k,
      methods,
      typeGroup,
      v,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  exports.type = typeGroup = _Node['default'].addType('aabb');

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

    _Class.prototype.toRect = function () {
      return this;
    };

    _Class.prototype.toString = function () {
      var objRep;
      objRep = '{x: ' + this.x + ', y: ' + this.y + ', width: ' + this.width + ', height: ' + this.height + '}';
      return 'Platter.geom.AABB#' + this.id + '(' + objRep + ')';
    };

    return _Class;
  })(_Primative['default']));

  exports.methods = methods = {
    dimension: {
      apply: function apply(width, height) {
        this.width = width;
        this.height = height;
      },
      finalize: function finalize() {
        if (!(this.width != null && this.height != null) || this.width <= 0 || this.height <= 0) {
          throw new Error('a dimension must be provided');
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
    type: {
      finalize: function finalize() {
        return this.type = typeGroup;
      }
    }
  };

  for (k in _primative.methods) {
    v = _primative.methods[k];
    aabbFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    aabbFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = aabbFactory;
});
