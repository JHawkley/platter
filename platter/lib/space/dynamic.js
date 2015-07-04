define(['exports', '../factory/base', './group', './node', '../math/vector'], function (exports, _factoryBase, _group, _node, _mathVector) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var _Vector = _interopRequireDefault(_mathVector);

  var dynamicFactory,
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

  exports.type = typeGroup = _Node['default'].addType('dynamic');

  dynamicFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    Object.defineProperty(_Class.prototype, 'delta', {
      get: function get() {
        return this._instanceData.delta;
      },
      set: function set(val) {
        var x, y;
        x = val.x, y = val.y;
        if (!(x != null && y != null)) {
          throw new Error('not a proper vector with `x` and `y` properties');
        }
        return this._instanceData.delta.setXY(x, y);
      }
    });

    function _Class(x, y, dx, dy) {
      var _instanceData;
      _Class.__super__.constructor.call(this, x, y);
      _instanceData = this._instanceData != null ? this._instanceData : this._instanceData = {
        delta: null
      };
      _instanceData.delta = _Vector['default'].create(dx != null ? dx : 0, dy != null ? dy : 0);
    }

    _Class.prototype.destroy = function () {
      var _instanceData;
      _Class.__super__.destroy.call(this);
      _instanceData = this._instanceData;
      _instanceData.delta.release();
      return _instanceData.delta = null;
    };

    _Class.prototype.checkType = function (type) {
      switch (false) {
        case type !== 0:
          return true;
        case !(!!(this.filter.allowed & type) && !(this.filter.excluded & type)):
          return true;
        default:
          return false;
      }
    };

    _Class.prototype.adoptObj = function (obj) {
      if (obj === this) {
        throw new Error('a group may not adopt itself');
      }
      if (this.checkType(obj.type)) {
        this.children.push(obj);
        if (typeof obj.wasAdoptedBy === 'function') {
          obj.wasAdoptedBy(this);
        }
      } else {
        throw new Error('object is not a permitted type for this group');
      }
      return this;
    };

    _Class.prototype.toString = function () {
      return 'Platter.space.Dynamic#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          allowed: 0,
          excluded: _Node['default'].types['group']
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
    if (k !== 'filter' && k !== 'type') {
      dynamicFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    dynamicFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = dynamicFactory;
});
