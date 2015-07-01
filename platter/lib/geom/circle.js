define(['exports', '../factory/base', '../space/node', './primative'], function (exports, _factoryBase, _spaceNode, _primative) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_spaceNode);

  var _Primative = _interopRequireDefault(_primative);

  var circleFactory,
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

  exports.type = typeGroup = _Node['default'].addType('circle');

  circleFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    Object.defineProperty(_Class.prototype, 'radius', {
      get: function get() {
        return this._data.radius;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.toRect = function () {
      return this._data.rect;
    };

    _Class.prototype.toString = function () {
      return 'Platter.geom.Circle#' + this.id + '({x: ' + this.x + ', y: ' + this.y + ', radius: ' + this.radius + '})';
    };

    return _Class;
  })(_Primative['default']));

  exports.methods = methods = {
    radius: {
      apply: function apply(r) {
        return this.radius = r;
      }
    },
    rectangle: {
      finalize: function finalize() {
        var d, r;
        r = this.radius;
        if (r == null) {
          throw new Error('no radius provided');
        }
        d = r * 2;
        return this.rect = {
          x: this.x - r,
          y: this.y - r,
          width: d,
          height: d
        };
      },
      seal: function seal() {
        return Object.freeze(this.rect);
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
    circleFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    circleFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = circleFactory;
});
