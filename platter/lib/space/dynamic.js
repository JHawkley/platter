define(['exports', 'module', './group', './node', '../math/vector'], function (exports, module, _group, _node, _mathVector) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var _Vector = _interopRequireDefault(_mathVector);

  var Dynamic,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  Dynamic = (function (superClass) {
    var typeGroup;

    extend(Dynamic, superClass);

    typeGroup = _Node['default'].addType('dynamic');

    function Dynamic(x, y, dx, dy) {
      _Group['default'].init(this, x, y, _Node['default'].types['group'], typeGroup);
      this.delta = _Vector['default'].create(dx != null ? dx : 0, dy != null ? dy : 0);
    }

    Dynamic.prototype.toString = function () {
      return 'Platter.space.Dynamic({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return Dynamic;
  })(_Group['default']);

  module.exports = Dynamic;
});
