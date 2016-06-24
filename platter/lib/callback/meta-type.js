define(['exports', 'module', './type', '../utils/array'], function (exports, module, _type, _utilsArray) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CallbackType = _interopRequireDefault(_type);

  var CallbackMetatype,
      anonCounter,
      procType,
      zeroes,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  anonCounter = 0;

  zeroes = '00000000000000000000000000000000';

  procType = function (cbType, data) {
    var arr, i, len, ref, subType, value;
    if (cbType.contributors != null) {
      ref = cbType.contributors;
      for (i = 0, len = ref.length; i < len; i++) {
        subType = ref[i];
        procType(subType, data);
      }
    } else {
      arr = data.contributors;
      value = cbType.value;
      if (value !== 0 && !(value & data.value)) {
        arr.push(cbType);
        data.value |= value;
      }
    }
  };

  CallbackMetatype = (function (superClass) {
    extend(CallbackMetatype, superClass);

    Object.defineProperty(CallbackMetatype.prototype, 'contributors', {
      get: function get() {
        return this._data.contributors;
      }
    });

    function CallbackMetatype(name, types) {
      var _data, i, len, type, vStr;
      switch (arguments.length) {
        case 0:
          name = null;
          types = [];
          break;
        case 1:
          switch (false) {
            case !(0, _utilsArray.isArray)(name):
              types = name;
              name = null;
              break;
            case !(name instanceof _CallbackType['default']):
              types = [name];
              name = null;
              break;
            default:
              types = [];
          }
          break;
        case 2:
          if (types instanceof _CallbackType['default']) {
            types = [types];
          }
      }
      this._data = _data = {
        name: null,
        value: 0x00000000,
        contributors: []
      };
      for (i = 0, len = types.length; i < len; i++) {
        type = types[i];
        procType(type, _data);
      }
      if (name == null) {
        vStr = (_data.value >>> 0).toString(2);
        name = "anonymous (" + (zeroes.substr(vStr.length) + vStr) + ")";
      }
      _data.name = name;
      Object.freeze(_data.contributors);
      Object.freeze(_data);
      return;
    }

    return CallbackMetatype;
  })(_CallbackType['default']);

  module.exports = CallbackMetatype;
});
