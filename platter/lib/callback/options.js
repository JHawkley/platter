define(['exports', 'module', '../utils/array'], function (exports, module, _utilsArray) {
  'use strict';

  var CallbackOptions;

  CallbackOptions = (function () {
    Object.defineProperty(CallbackOptions.prototype, 'included', {
      get: function get() {
        return this._data.included;
      }
    });

    Object.defineProperty(CallbackOptions.prototype, 'excluded', {
      get: function get() {
        return this._data.excluded;
      }
    });

    Object.defineProperty(CallbackOptions.prototype, 'isStrict', {
      get: function get() {
        return this._data.strict;
      }
    });

    Object.defineProperty(CallbackOptions.prototype, 'isSealed', {
      get: function get() {
        return this._data.sealed;
      }
    });

    function CallbackOptions(includedTypes) {
      this._data = {
        included: 0,
        excluded: 0,
        strict: false,
        sealed: false
      };
      if (includedTypes != null) {
        this.including(includedTypes);
      }
      return;
    }

    CallbackOptions.prototype.including = function (cbTypes) {
      var _data, cbType, i, len;
      _data = this._data;
      cbTypes = (0, _utilsArray.isArray)(cbTypes) ? cbTypes.slice(0) : [cbTypes];
      for (i = 0, len = cbTypes.length; i < len; i++) {
        cbType = cbTypes[i];
        _data.included |= cbType.value;
      }
      return this;
    };

    CallbackOptions.prototype.excluding = function (cbTypes) {
      var _data, cbType, i, len;
      _data = this._data;
      cbTypes = (0, _utilsArray.isArray)(cbTypes) ? cbTypes.slice(0) : [cbTypes];
      for (i = 0, len = cbTypes.length; i < len; i++) {
        cbType = cbTypes[i];
        _data.excluded |= cbType.value;
      }
      return this;
    };

    CallbackOptions.prototype.strict = function () {
      this._data.strict = true;
      return this;
    };

    CallbackOptions.prototype.test = function (cbType) {
      var _data, value;
      _data = this._data;
      value = cbType.value;
      if (_data.excluded & value) {
        return false;
      }
      if (_data.strict) {
        return _data.included === value;
      }
      return !!(_data.included & value);
    };

    CallbackOptions.prototype.seal = function () {
      var _data;
      _data = this._data;
      _data.sealed = true;
      Object.freeze(_data);
      return this;
    };

    return CallbackOptions;
  })();

  module.exports = CallbackOptions;
});
