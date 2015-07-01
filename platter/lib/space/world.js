define(['exports', 'module', './group', './node'], function (exports, module, _group, _node) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var World,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  World = (function (superClass) {
    var typeGroup;

    extend(World, superClass);

    typeGroup = _Node['default'].addType('world');

    function World(bounds) {
      var ref, ref1;
      if (bounds == null) {
        throw new Error('argument `bounds` must be provided');
      }
      _Group['default'].init(this, bounds.x, bounds.y, null, typeGroup);
      this.width = (function () {
        if ((ref = bounds.width) != null) {
          return ref;
        } else {
          throw new Error('missing argument: bounds.width');
        }
      })();
      this.height = (function () {
        if ((ref1 = bounds.height) != null) {
          return ref1;
        } else {
          throw new Error('missing argument: bounds.height');
        }
      })();
      this.time = 0;
    }

    World.prototype.step = function (timeLapsed) {
      return this.time += timeLapsed;
    };

    World.prototype.wasAdoptedBy = function () {
      throw new Error('worlds must remain a root node');
    };

    World.prototype.asRect = function () {
      return this;
    };

    World.prototype.toString = function () {
      return 'Platter.space.World({x: ' + this.x + ', y: ' + this.y + ', width: ' + this.width + ', height: ' + this.height + '})';
    };

    return World;
  })(_Group['default']);

  module.exports = World;
});
