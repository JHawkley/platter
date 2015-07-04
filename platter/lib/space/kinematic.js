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

    Object.defineProperty(_Class.prototype, 'body', {
      get: function get() {
        return this._instanceData.body;
      },
      set: function set(val) {
        return this.setBody(val);
      }
    });

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

    Object.defineProperty(_Class.prototype, 'mirror', {
      get: function get() {
        return this.flipX;
      },
      set: function set(val) {
        return this.flipX = val;
      }
    });

    Object.defineProperty(_Class.prototype, 'invert', {
      get: function get() {
        return this.flipY;
      },
      set: function set(val) {
        return this.flipY = val;
      }
    });

    function _Class(x, y) {
      var _instanceData;
      _Class.__super__.constructor.call(this, x, y);
      _instanceData = this._instanceData != null ? this._instanceData : this._instanceData = {
        body: null,
        delta: null
      };
      _instanceData.body = null;
      _instanceData.delta = _Vector['default'].create(0, 0);
      this.flipX = false;
      this.flipY = false;
      this.floating = true;
      this.minClimableGrade = -45 * (Math.PI / 180);
      this.maxClimableGrade = 45 * (Math.PI / 180);
    }

    _Class.prototype.destroy = function () {
      var _instanceData;
      _Class.__super__.destroy.call(this);
      _instanceData = this._instanceData;
      _instanceData.delta.release();
      _instanceData.body = null;
      return _instanceData.delta = null;
    };

    _Class.prototype.setBody = function (body) {
      if (body != null) {
        if (body.parent !== this) {
          throw new Error('a body must be a child of the kinematic');
        }
        if (!(body.type & _geomAabb.type)) {
          throw new Error('only AABBs may be a body');
        }
      }
      this._instanceData.body = body;
      return this;
    };

    _Class.prototype.orphanObj = function (obj) {
      _Class.__super__.orphanObj.call(this, obj);
      if (obj === this._instanceData.body) {
        this._instanceData.body = null;
      }
      return this;
    };

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
