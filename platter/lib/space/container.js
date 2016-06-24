define(['exports', '../factory/base', './group', './node', './_type'], function (exports, _factoryBase, _group, _node, _type) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var containerFactory,
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

  containerFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance, x, y) {
      return _Class.__super__.constructor.init.call(this, instance, x, y);
    };

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.toString = function () {
      return "Platter.space.Container#" + this.id + "({x: " + this.x + ", y: " + this.y + "})";
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          included: [_type.group],
          excluded: []
        };
      },
      seal: function seal() {
        return _group.methods.filter.seal.call(this);
      }
    },
    typeGroup: {
      finalize: function finalize() {
        _group.methods.typeGroup.finalize.call(this);
        return this.type.push(_type.container);
      }
    }
  };

  for (k in _node.methods) {
    v = _node.methods[k];
    containerFactory.method(k, v);
  }

  for (k in _group.methods) {
    v = _group.methods[k];
    if (k !== 'filter' && k !== 'include' && k !== 'typeGroup') {
      containerFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    containerFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = containerFactory;
});
