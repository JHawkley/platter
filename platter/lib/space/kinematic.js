define(['exports', '../factory/base', './group', './node', './_type', '../math/vector-interpolation', '../geom/_type'], function (exports, _factoryBase, _group, _node, _type, _mathVectorInterpolation, _geom_type) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _VectorInterpolation = _interopRequireDefault(_mathVectorInterpolation);

  var allowedTypes,
      k,
      kinematicFactory,
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

  allowedTypes = [_geom_type.point, _geom_type.circle, _geom_type.aabb];

  kinematicFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance, x, y) {
      _Class.__super__.constructor.init.call(this, instance, x, y);
      instance.flipX = false;
      instance.flipY = false;
      instance.floating = true;
      instance.minClimableGrade = -45 * (Math.PI / 180);
      return instance.maxClimableGrade = 45 * (Math.PI / 180);
    };

    Object.defineProperty(_Class.prototype, 'body', {
      get: function get() {
        return this._instanceData.undynesBody;
      },
      set: function set(val) {
        return this.setBody(val);
      }
    });

    Object.defineProperty(_Class.prototype, 'delta', {
      get: function get() {
        return this._instanceData.delta;
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
      _Class.__super__.constructor.call(this, x, y);
      this._instanceData = {
        undynesBody: null,
        delta: new _VectorInterpolation['default']()
      };
    }

    _Class.prototype.destroy = function () {
      var _instanceData;
      _Class.__super__.destroy.call(this);
      _instanceData = this._instanceData;
      _instanceData.delta.clear();
      return _instanceData.undynesBody = null;
    };

    _Class.prototype.setBody = function (body) {
      if (body != null) {
        if (body.parent !== this) {
          throw new Error('a body must be a child of the kinematic');
        }
        if (!_geom_type.aabb.test(body.type)) {
          throw new Error('only AABBs may be a body');
        }
      }
      this._instanceData.undynesBody = body;
      return this;
    };

    _Class.prototype.orphan = function (obj) {
      _Class.__super__.orphan.call(this, obj);
      if (obj === this._instanceData.undynesBody) {
        this._instanceData.undynesBody = null;
      }
      return this;
    };

    _Class.prototype.toString = function () {
      return "Platter.space.Kinematic#" + this.id + "({x: " + this.x + ", y: " + this.y + "})";
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          included: allowedTypes.slice(0),
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
        return this.type.push(_type.kinematic);
      }
    }
  };

  for (k in _node.methods) {
    v = _node.methods[k];
    kinematicFactory.method(k, v);
  }

  for (k in _group.methods) {
    v = _group.methods[k];
    if (k !== 'filter' && k !== 'include' && k !== 'typeGroup') {
      kinematicFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    kinematicFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = kinematicFactory;
});
