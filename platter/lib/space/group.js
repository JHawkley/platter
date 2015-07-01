define(['exports', 'module', './node', '../utils/find-bounds', '../utils/es6'], function (exports, module, _node, _utilsFindBounds, _utilsEs6) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Node = _interopRequireDefault(_node);

  var _findBounds = _interopRequireDefault(_utilsFindBounds);

  var Group,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  Group = (function (superClass) {
    var typeGroup;

    extend(Group, superClass);

    typeGroup = _Node['default'].addType('group');

    function Group() {
      throw new Error('this class is abstract and is not instantiable');
    }

    Group.init = function (instance, x, y, filter, group) {
      group = (group != null ? group : 0) | typeGroup;
      _Node['default'].init(instance, x, y, group);
      instance._filteredNodeTypes = filter != null ? filter : 0;
      instance.children = [];
      return instance._rect = {};
    };

    Group.prototype[_utilsEs6.iteratorSymbol] = function () {
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

    Group.prototype.adopt = function () {
      var i, len, obj;
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        this.adoptObj(obj);
      }
      return this;
    };

    Group.prototype.adoptObj = function (obj) {
      var ref;
      if (obj === this) {
        throw new Error('a group may not adopt itself');
      }
      if (!!(this._filteredNodeTypes & ((ref = obj.type) != null ? ref : 0))) {
        throw new Error('object is not a permitted type for this group');
      }
      this.children.push(obj);
      if (typeof obj.wasAdoptedBy === 'function') {
        obj.wasAdoptedBy(this);
      }
      return this;
    };

    Group.prototype.orphan = function () {
      var i, len, obj;
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        this.orphanObj(obj);
      }
      return this;
    };

    Group.prototype.orphanObj = function (obj) {
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

    Group.prototype.toRect = function () {
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

    Group.prototype.toString = function () {
      return 'Platter.space.Group({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return Group;
  })(_Node['default']);

  module.exports = Group;
});
