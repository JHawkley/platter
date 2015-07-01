define(['exports', '../factory/base', './node', '../utils/find-bounds', '../utils/es6'], function (exports, _factoryBase, _node, _utilsFindBounds, _utilsEs6) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_node);

  var _findBounds = _interopRequireDefault(_utilsFindBounds);

  var groupFactory,
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

  exports.type = typeGroup = _Node['default'].addType('group');

  groupFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    Object.defineProperty(_Class.prototype, 'filter', {
      get: function get() {
        return this._data.filter;
      }
    });

    function _Class(x, y) {
      _Class.__super__.constructor.call(this, x, y);
      this._rect = {};
      this.children = [];
    }

    _Class.prototype.destroy = function () {
      if (this.children.length > 0) {
        throw new Error('cannot be destroyed with children adopted');
      }
      return _Class.__super__.destroy.call(this);
    };

    _Class.prototype[_utilsEs6.iteratorSymbol] = function () {
      var currentIndex, result, subIterator;
      currentIndex = 0;
      subIterator = null;
      result = {
        value: null,
        done: false
      };
      return {
        next: (function (_this) {
          return function () {
            var child, it, si;
            if (subIterator != null) {
              if ((it = subIterator.next()).done !== true) {
                result.value = it.value;
                return result;
              } else {
                subIterator = null;
              }
            }
            while (true) {
              if (currentIndex < _this.children.length) {
                child = _this.children[currentIndex++];
                if ((0, _utilsEs6.isIterable)(child)) {
                  si = child[_utilsEs6.iteratorSymbol]();
                  if ((it = si.next()).done !== true) {
                    subIterator = si;
                    result.value = it.value;
                    return result;
                  }
                  continue;
                } else {
                  result.value = child;
                  return result;
                }
              } else {
                result.value = null;
                result.done = true;
                return result;
              }
            }
          };
        })(this)
      };
    };

    _Class.prototype.adopt = function () {
      var i, len, obj;
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        this.adoptObj(obj);
      }
      return this;
    };

    _Class.prototype.adoptObj = function (obj) {
      var type;
      if (obj === this) {
        throw new Error('a group may not adopt itself');
      }
      type = obj.type;
      if (!!(this.filter.allowed & type) && !(this.filter.excluded & type)) {
        this.children.push(obj);
        if (typeof obj.wasAdoptedBy === 'function') {
          obj.wasAdoptedBy(this);
        }
      } else {
        throw new Error('object is not a permitted type for this group');
      }
      return this;
    };

    _Class.prototype.orphan = function () {
      var i, len, obj;
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        this.orphanObj(obj);
      }
      return this;
    };

    _Class.prototype.orphanObj = function (obj) {
      var idx;
      idx = this.children.indexOf(obj);
      if (idx === -1) {
        return;
      }
      this.children.splice(idx, 1);
      if (typeof obj.wasOrphanedBy === 'function') {
        obj.wasOrphanedBy(this);
      }
      return this;
    };

    _Class.prototype.toRect = function () {
      var child, rectOut, rects;
      rectOut = this._rect;
      rects = (function () {
        var i, len, ref, ref1, ref2, results;
        ref = this.children;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          if (((ref1 = child.children) != null ? ref1.length : void 0) !== 0) {
            results.push((ref2 = typeof child.toRect === 'function' ? child.toRect() : void 0) != null ? ref2 : child);
          }
        }
        return results;
      }).call(this);
      (0, _findBounds['default'])(rects, rectOut);
      rectOut.x += this.x;
      rectOut.y += this.y;
      return rectOut;
    };

    _Class.prototype.toString = function () {
      return 'Platter.space.Group#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return _Class;
  })(_Node['default']));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          allowed: 0,
          excluded: 0
        };
      },
      seal: function seal() {
        return Object.freeze(this.filter);
      }
    },
    allow: {
      apply: function apply(flags) {
        return this.filter.allowed |= flags;
      },
      finalize: function finalize() {
        if (this.filter.allowed === 0) {
          return this.filter.allowed = ~0 >>> 0;
        }
      }
    },
    exclude: {
      apply: function apply(flags) {
        return this.filter.excluded |= flags;
      }
    },
    type: {
      finalize: function finalize() {
        return this.type = typeGroup;
      }
    }
  };

  for (k in methods) {
    v = methods[k];
    groupFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = groupFactory;
});
