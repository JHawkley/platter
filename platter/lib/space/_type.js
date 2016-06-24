define(['exports', '../callback/type'], function (exports, _callbackType) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CallbackType = _interopRequireDefault(_callbackType);

  var container, dynamic, group, kinematic, world;

  exports.container = container = _CallbackType['default'].add('container');

  exports.dynamic = dynamic = _CallbackType['default'].add('dynamic');

  exports.group = group = _CallbackType['default'].add('group');

  exports.kinematic = kinematic = _CallbackType['default'].add('kinematic');

  exports.world = world = _CallbackType['default'].add('world');

  exports.container = container;
  exports.dynamic = dynamic;
  exports.group = group;
  exports.kinematic = kinematic;
  exports.world = world;
});
