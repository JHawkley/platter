define(['exports', 'module', './group', './node'], function (exports, module, _group, _node) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Group = _interopRequireDefault(_group);

  var _Node = _interopRequireDefault(_node);

  var Container,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  Container = (function (superClass) {
    var typeGroup;

    extend(Container, superClass);

    typeGroup = _Node['default'].addType('container');

    function Container(x, y) {
      _Group['default'].init(this, x, y, ~_Node['default'].types['group'] >>> 0, typeGroup);
    }

    Container.prototype.adoptObj = function (obj) {
      var ref, type;
      if (obj === this) {
        throw new Error('a group may not adopt itself');
      }
      type = (ref = obj.type) != null ? ref : 0;
      if (type === 0 || !!(this._filteredNodeTypes & type)) {
        throw new Error('object is not a permitted type for this group');
      }
      this.children.push(obj);
      return typeof obj.wasAdoptedBy === 'function' ? obj.wasAdoptedBy(this) : void 0;
    };

    Container.prototype.toString = function () {
      return 'Platter.space.Container({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return Container;
  })(_Group['default']);

  module.exports = Container;
});
