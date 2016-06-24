define(['exports', '../callback/type'], function (exports, _callbackType) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CallbackType = _interopRequireDefault(_callbackType);

  var aabb, chain, chainLink, circle, line, point;

  exports.aabb = aabb = _CallbackType['default'].add('aabb');

  exports.chainLink = chainLink = _CallbackType['default'].add('chain-link');

  exports.chain = chain = _CallbackType['default'].add('chain');

  exports.circle = circle = _CallbackType['default'].add('circle');

  exports.line = line = _CallbackType['default'].add('line');

  exports.point = point = _CallbackType['default'].add('point');

  exports.aabb = aabb;
  exports.chainLink = chainLink;
  exports.chain = chain;
  exports.circle = circle;
  exports.line = line;
  exports.point = point;
});
