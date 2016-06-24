define(['exports', 'module', './options', '../utils/array'], function (exports, module, _options, _utilsArray) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CallbackOptions = _interopRequireDefault(_options);

  var CallbackAll,
      CallbackGroup,
      CallbackNull,
      CallbackType,
      CallbackUnit,
      curTypeShift,
      types,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  types = {};

  curTypeShift = 0;

  CallbackType = (function () {
    CallbackType.get = function (name) {
      var ref;
      return (function () {
        if ((ref = types[name]) != null) {
          return ref;
        } else {
          throw new Error('no such type or group exists');
        }
      })();
    };

    CallbackType.add = function (name) {
      var value;
      if (types[name] != null) {
        return types[name];
      }
      value = 1 << curTypeShift++;
      if (curTypeShift > 31) {
        throw new Error('too many callback types');
      }
      return new CallbackUnit(name, value);
    };

    CallbackType.addToGroup = function (name, cbType) {
      var cbGroup;
      cbGroup = types[name];
      if (cbGroup != null) {
        cbGroup.add(cbType);
      } else {
        cbGroup = types[name] = new CallbackGroup(name, cbType);
      }
      return cbGroup;
    };

    Object.defineProperty(CallbackType.prototype, 'name', {
      get: function get() {
        return this._data.name;
      }
    });

    Object.defineProperty(CallbackType.prototype, 'value', {
      get: function get() {
        return this._data.value;
      }
    });

    Object.defineProperty(CallbackType.prototype, 'included', {
      get: function get() {
        return this._data.value;
      }
    });

    Object.defineProperty(CallbackType.prototype, 'excluded', {
      value: 0
    });

    function CallbackType() {
      throw new Error('cannot be instantiated; use `CallbackType.add()` instead');
    }

    CallbackType.prototype.including = function (cbTypes) {
      cbTypes = (0, _utilsArray.isArray)(cbTypes) ? cbTypes.slice(0) : [cbTypes];
      cbTypes.push(this);
      return new _CallbackOptions['default'](cbTypes);
    };

    CallbackType.prototype.excluding = function (cbTypes) {
      cbTypes = (0, _utilsArray.isArray)(cbTypes) ? cbTypes.slice(0) : [cbTypes];
      return new _CallbackOptions['default'](this).excluding(cbTypes);
    };

    CallbackType.prototype.strict = function () {
      throw new Error('CallbackType is immutable; convert to a CallbackOptions first');
    };

    CallbackType.prototype.test = function (cbType) {
      return !!(this.value & cbType.value);
    };

    CallbackType.prototype.seal = function () {};

    return CallbackType;
  })();

  CallbackUnit = (function (superClass) {
    extend(CallbackUnit, superClass);

    function CallbackUnit(name, value) {
      this._data = {
        name: name,
        value: value
      };
      Object.freeze(this._data);
      types[name] = this;
      return;
    }

    return CallbackUnit;
  })(CallbackType);

  new (CallbackNull = (function (superClass) {
    extend(CallbackNull, superClass);

    function CallbackNull() {
      var name;
      name = 'null';
      this._data = {
        name: name,
        value: 0x00000000
      };
      Object.freeze(this._data);
      types[name] = this;
      return;
    }

    CallbackNull.prototype.test = function (cbType) {
      return this.value === cbType.value;
    };

    return CallbackNull;
  })(CallbackType))();

  new (CallbackAll = (function (superClass) {
    extend(CallbackAll, superClass);

    function CallbackAll() {
      var name;
      name = 'all';
      this._data = {
        name: name,
        value: ~0x00000000
      };
      Object.freeze(this._data);
      types[name] = this;
      return;
    }

    return CallbackAll;
  })(CallbackType))();

  CallbackGroup = (function (superClass) {
    extend(CallbackGroup, superClass);

    Object.defineProperty(CallbackGroup.prototype, 'contributors', {
      get: function get() {
        return this._data.contributors;
      }
    });

    function CallbackGroup(name, cbType) {
      this._data = {
        name: name,
        value: 0x00000000,
        contributors: []
      };
      this.add(cbType);
      if (this._data.length === 0) {
        throw new Error('group has no valid contributors');
      }
      types[name] = this;
      return;
    }

    CallbackGroup.prototype.add = function (cbType) {
      var contributors, i, j, len, ref, results, subType;
      if (cbType.contributors != null) {
        ref = cbType.contributors;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          subType = ref[j];
          results.push(this.add(subType));
        }
        return results;
      } else if (cbType.value !== 0) {
        contributors = this._data.contributors;
        i = contributors.indexOf(cbType);
        if (i === -1) {
          contributors.push(cbType);
          return this._data.value |= cbType.value;
        }
      }
    };

    return CallbackGroup;
  })(CallbackType);

  module.exports = CallbackType;
});
