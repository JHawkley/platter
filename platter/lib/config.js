define(['exports', 'module', './broadphase/quad-tree'], function (exports, module, _broadphaseQuadTree) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _QuadTree = _interopRequireDefault(_broadphaseQuadTree);

  var config;

  config = {
    touchingTolerance: 0.001,
    broadphaseClass: _QuadTree['default']
  };

  module.exports = config;
});
