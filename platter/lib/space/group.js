define(['exports', '../factory/base', './node', '../callback/type', './_type', '../callback/options', '../math/rect', '../utils/es6', '../utils/array'], function (exports, _factoryBase, _node, _callbackType, _type, _callbackOptions, _mathRect, _utilsEs6, _utilsArray) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_node);

  var _CallbackType = _interopRequireDefault(_callbackType);

  var _CallbackOptions = _interopRequireDefault(_callbackOptions);

  var _Rect = _interopRequireDefault(_mathRect);

  var groupFactory,
      k,
      methods,
      v,
      workingRect,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  workingRect = _Rect['default'].create();

  groupFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance, x, y) {
      return _Class.__super__.constructor.init.call(this, instance, x, y);
    };

    Object.defineProperty(_Class.prototype, 'filter', {
      get: function get() {
        return this._data.filter;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
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

    _Class.prototype.adopt = function (obj) {
      var type;
      if (obj === this) {
        throw new Error('a group may not adopt itself');
      }
      type = obj.type;
      if (this.filter.test(obj.type)) {
        this.children.push(obj);
        if (typeof obj.wasAdoptedBy === "function") {
          obj.wasAdoptedBy(this);
        }
      } else {
        throw new Error('object is not a permitted type for this group');
      }
      return this;
    };

    _Class.prototype.adoptObjs = function () {
      var i, len, obj;
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        this.adopt(obj);
      }
      return this;
    };

    _Class.prototype.orphan = function (obj) {
      var idx;
      idx = this.children.indexOf(obj);
      if (idx === -1) {
        return;
      }
      this.children.splice(idx, 1);
      if (typeof obj.wasOrphanedBy === "function") {
        obj.wasOrphanedBy(this);
      }
      return this;
    };

    _Class.prototype.orphanObjs = function () {
      var i, len, obj;
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        this.orphan(obj);
      }
      return this;
    };

    _Class.prototype.toRect = function (out) {
      var bottom, child, i, left, len, ref, ref1, right, top, wr;
      top = left = Number.POSITIVE_INFINITY;
      bottom = right = Number.NEGATIVE_INFINITY;
      ref = this.children;
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        if (!(((ref1 = child.children) != null ? ref1.length : void 0) !== 0)) {
          continue;
        }
        wr = child.toRect(workingRect);
        top = Math.min(top, wr.top);
        left = Math.min(left, wr.left);
        bottom = Math.max(bottom, wr.bottom);
        right = Math.max(right, wr.right);
      }
      if (wr == null) {
        out.setProps(this.x, this.y, 0, 0);
      } else {
        out.x = left + this.x;
        out.y = top + this.y;
        out.width = right - left;
        out.height = bottom - top;
      }
      return out;
    };

    _Class.prototype.toString = function () {
      return "Platter.space.Group#" + this.id + "({x: " + this.x + ", y: " + this.y + "})";
    };

    return _Class;
  })(_Node['default']));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          included: [],
          excluded: []
        };
      },
      seal: function seal() {
        var filter;
        filter = this.filter;
        return this.filter = new _CallbackOptions['default'](filter.included).excluding(filter.excluded).seal();
      }
    },
    include: {
      apply: function apply(cbType) {
        var ref;
        if ((0, _utilsArray.isArray)(cbType)) {
          return (ref = this.filter.included).push.apply(ref, cbType);
        } else {
          return this.filter.included.push(cbType);
        }
      },
      finalize: function finalize() {
        if (this.filter.included.length === 0) {
          return this.filter.included.push(_CallbackType['default'].get('all'));
        }
      }
    },
    exclude: {
      apply: function apply(cbType) {
        var ref;
        if ((0, _utilsArray.isArray)(cbType)) {
          return (ref = this.filter.excluded).push.apply(ref, cbType);
        } else {
          return this.filter.excluded.push(cbType);
        }
      }
    },
    typeGroup: {
      finalize: function finalize() {
        return this.type.push(_type.group);
      }
    }
  };

  for (k in _node.methods) {
    v = _node.methods[k];
    groupFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    groupFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = groupFactory;
});
