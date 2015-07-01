define(['exports', '../factory/base', '../space/node', './primative'], function (exports, _factoryBase, _spaceNode, _primative) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_spaceNode);

  var _Primative = _interopRequireDefault(_primative);

  var k,
      methods,
      pointFactory,
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

  exports.type = typeGroup = _Node['default'].addType('point');

  pointFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.toRect = function () {
      return this._data.rect;
    };

    _Class.prototype.toString = function () {
      return 'Platter.geom.Point#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
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
    type: {
      finalize: function finalize() {
        return this.type = typeGroup;
      }
    }
  };

  for (k in _primative.methods) {
    v = _primative.methods[k];
    pointFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    pointFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = pointFactory;
});
