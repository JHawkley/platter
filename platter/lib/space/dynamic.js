define(['exports', '../factory/base', './group', './node', './_type', '../math/vector-interpolation'], function (exports, _factoryBase, _group, _node, _type, _mathVectorInterpolation) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _VectorInterpolation = _interopRequireDefault(_mathVectorInterpolation);

  var dynamicFactory,
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

  dynamicFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance, x, y) {
      return _Class.__super__.constructor.init.call(this, instance, x, y);
    };

    Object.defineProperty(_Class.prototype, 'delta', {
      get: function get() {
        return this._instanceData.delta;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
      this._instanceData = {
        delta: new _VectorInterpolation['default']()
      };
      Object.freeze(this._instanceData);
    }

    _Class.prototype.destroy = function () {
      _Class.__super__.destroy.call(this);
      return this._instanceData.delta.clear();
    };

    _Class.prototype.checkType = function (type) {
      switch (false) {
        case type.value !== 0x00000000:
          return true;
        case !this.filter.test(type):
          return true;
        default:
          return false;
      }
    };

    _Class.prototype.adopt = function (obj) {
      if (obj === this) {
        throw new Error('a group may not adopt itself');
      }
      if (this.checkType(obj.type)) {
        this.children.push(obj);
        if (typeof obj.wasAdoptedBy === "function") {
          obj.wasAdoptedBy(this);
        }
      } else {
        throw new Error('object is not a permitted type for this group');
      }
      return this;
    };

    _Class.prototype.toString = function () {
      return "Platter.space.Dynamic#" + this.id + "({x: " + this.x + ", y: " + this.y + "})";
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          included: [],
          excluded: [_type.group]
        };
      },
      seal: function seal() {
        return _group.methods.filter.seal.call(this);
      }
    },
    typeGroup: {
      finalize: function finalize() {
        _group.methods.typeGroup.finalize.call(this);
        return this.type.push(_type.dynamic);
      }
    }
  };

  for (k in _node.methods) {
    v = _node.methods[k];
    dynamicFactory.method(k, v);
  }

  for (k in _group.methods) {
    v = _group.methods[k];
    if (k !== 'filter' && k !== 'typeGroup') {
      dynamicFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    dynamicFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = dynamicFactory;
});
