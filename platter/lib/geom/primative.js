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

    Object.defineProperty(Primative.prototype, 'type', {
      get: function get() {
        return this._data.type;
      }
    });

    Object.defineProperty(Primative.prototype, 'filter', {
      get: function get() {
        return this._data.filter;
      }
    });

    function Primative() {
      this._parent = null;
    }

    Primative.prototype.toString = function () {
      return 'Platter.geom.Primative#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
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
    },
    filter: {
      init: function init() {
        return this.filter = {
          group: 0,
          mask: 0
        };
      },
      seal: function seal() {
        return Object.freeze(this.filter);
      }
    },
    group: {
      apply: function apply(flags) {
        return this.filter.group = this.filter.group | flags;
      }
    },
    mask: {
      apply: function apply(flags) {
        return this.filter.mask = this.filter.mask | flags;
      }
    }
  };

  exports.methods = methods;
  exports['default'] = Primative;
});
