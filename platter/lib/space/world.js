define(['exports', '../factory/base', './group', './node'], function (exports, _factoryBase, _group, _node) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var k,
      methods,
      typeGroup,
      v,
      worldFactory,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  exports.type = typeGroup = _Node['default'].addType('world');

  worldFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    Object.defineProperty(_Class.prototype, 'x', {
      get: function get() {
        return this._data.x;
      }
    });

    Object.defineProperty(_Class.prototype, 'y', {
      get: function get() {
        return this._data.y;
      }
    });

    Object.defineProperty(_Class.prototype, 'width', {
      get: function get() {
        return this._data.width;
      }
    });

    Object.defineProperty(_Class.prototype, 'height', {
      get: function get() {
        return this._data.height;
      }
    });

    function _Class() {
      this._parent = null;
      this._rect = {};
      this.children = [];
      this.time = 0;
    }

    _Class.prototype.step = function (timeLapsed) {
      return this.time += timeLapsed;
    };

    _Class.prototype.wasAdoptedBy = function () {
      throw new Error('worlds must remain a root node');
    };

    _Class.prototype.toRect = function () {
      return this;
    };

    _Class.prototype.contentAsRect = function () {
      return _Group['default'].ctor.prototype.toRect.call(this);
    };

    _Class.prototype.toString = function () {
      var bounds;
      bounds = '{x: ' + this.x + ', y: ' + this.y + ', width: ' + this.width + ', height: ' + this.height + '}';
      return 'Platter.space.World#' + this.id + '(' + bounds + ')';
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
    position: {
      init: function init() {
        this.x = 0;
        return this.y = 0;
      },
      apply: function apply(x, y) {
        this.x = x;
        this.y = y;
      }
    },
    dimension: {
      apply: function apply(width, height) {
        this.width = width;
        this.height = height;
      },
      finalize: function finalize() {
        if (!(this.width != null && this.height != null) || this.width <= 0 || this.height <= 0) {
          throw new Error('a dimension must be provided');
        }
      }
    },
    width: {
      apply: function apply(width) {
        this.width = width;
      }
    },
    height: {
      apply: function apply(height) {
        this.height = height;
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
    if (k !== 'filter' && k !== 'allow' && k !== 'exclude' && k !== 'type') {
      worldFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    worldFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = worldFactory;
});
