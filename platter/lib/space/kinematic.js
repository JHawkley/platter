define(['exports', '../factory/base', './group', './node', '../math/vector', '../geom/point', '../geom/circle', '../geom/aabb'], function (exports, _factoryBase, _group, _node, _mathVector, _geomPoint, _geomCircle, _geomAabb) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var _Vector = _interopRequireDefault(_mathVector);

  var allowedNodeTypes,
      k,
      kinematicFactory,
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

  exports.type = typeGroup = _Node['default'].addType('kinematic');

  allowedNodeTypes = _geomPoint.type | _geomCircle.type | _geomAabb.type;

  kinematicFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    function _Class(x, y, dx, dy) {
      _Class.__super__.constructor.call(this, x, y);
      this.delta = _Vector['default'].create(dx != null ? dx : 0, dy != null ? dy : 0);
    }

    _Class.prototype.toString = function () {
      return 'Platter.space.Kinematic#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          allowed: allowedNodeTypes,
          excluded: _group.type
        };
      },
      seal: function seal() {
        return Object.freeze(this.filter);
      }
    },
    type: {
      finalize: function finalize() {
        _group.methods.type.finalize.call(this);
        return this.type |= typeGroup;
      }
    }
  };

  for (k in _group.methods) {
    v = _group.methods[k];
    if (k !== 'filter' && k !== 'allow' && k !== 'type') {
      kinematicFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    kinematicFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = kinematicFactory;
});
