define(['exports', '../factory/base', './group', './node'], function (exports, _factoryBase, _group, _node) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var containerFactory,
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

  exports.type = typeGroup = _Node['default'].addType('container');

  containerFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    function _Class(x, y) {
      _Class.__super__.constructor.call(this, x, y);
    }

    _Class.prototype.toString = function () {
      return 'Platter.space.Container#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          allowed: _Node['default'].types['group'],
          excluded: 0
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
      containerFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    containerFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = containerFactory;
});
