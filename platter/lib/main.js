define(['exports', 'module', './broadphase/quad-tree', './geom/point', './geom/line', './geom/circle', './geom/aabb', './geom/chain-link', './geom/chain', './math/matrix', './math/vector', './space/node', './space/group', './space/container', './space/kinematic', './space/dynamic', './space/world'], function (exports, module, _broadphaseQuadTree, _geomPoint, _geomLine, _geomCircle, _geomAabb, _geomChainLink, _geomChain, _mathMatrix, _mathVector, _spaceNode, _spaceGroup, _spaceContainer, _spaceKinematic, _spaceDynamic, _spaceWorld) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _QuadTree = _interopRequireDefault(_broadphaseQuadTree);

  var _Point = _interopRequireDefault(_geomPoint);

  var _Line = _interopRequireDefault(_geomLine);

  var _Circle = _interopRequireDefault(_geomCircle);

  var _AABB = _interopRequireDefault(_geomAabb);

  var _ChainLink = _interopRequireDefault(_geomChainLink);

  var _Chain = _interopRequireDefault(_geomChain);

  var _Matrix = _interopRequireDefault(_mathMatrix);

  var _Node = _interopRequireDefault(_spaceNode);

  var _Group = _interopRequireDefault(_spaceGroup);

  var _Container = _interopRequireDefault(_spaceContainer);

  var _Kinematic = _interopRequireDefault(_spaceKinematic);

  var _Dynamic = _interopRequireDefault(_spaceDynamic);

  var _World = _interopRequireDefault(_spaceWorld);

  var Platter;

  Platter = {
    broadphase: {
      QuadTree: _QuadTree['default']
    },
    geom: {
      Point: _Point['default'],
      Line: _Line['default'],
      Circle: _Circle['default'],
      AABB: _AABB['default'],
      ChainLink: _ChainLink['default'],
      Chain: _Chain['default']
    },
    math: {
      Matrix: _Matrix['default'],
      MutableVector: _mathVector.MutableVector,
      ImmutableVector: _mathVector.ImmutableVector
    },
    space: {
      Node: _Node['default'],
      Group: _Group['default'],
      Container: _Container['default'],
      Kinematic: _Kinematic['default'],
      Dynamic: _Dynamic['default'],
      World: _World['default']
    }
  };

  module.exports = Platter;
});
