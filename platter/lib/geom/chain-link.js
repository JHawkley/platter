define(['exports', '../factory/base', '../callback/type', './line', './_type', '../space/node', './primative'], function (exports, _factoryBase, _callbackType, _line, _type, _spaceNode, _primative) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _CallbackType = _interopRequireDefault(_callbackType);

  var _Line = _interopRequireDefault(_line);

  var chainLinkFactory,
      k,
      methods,
      v,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  chainLinkFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance, host) {
      if (host == null) {
        throw new Error('a chain-link requires a chain to host it');
      }
      instance._instanceData = {
        host: host
      };
      return Object.freeze(instance._instanceData);
    };

    Object.defineProperty(_Class.prototype, 'host', {
      get: function get() {
        return this._instanceData.host;
      }
    });

    Object.defineProperty(_Class.prototype, 'prev', {
      get: function get() {
        return this._instanceData.host.getPrev(this);
      }
    });

    Object.defineProperty(_Class.prototype, 'next', {
      get: function get() {
        return this._instanceData.host.getNext(this);
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.destroy = function () {
      this._instanceData = null;
      return _Class.__super__.destroy.call(this);
    };

    _Class.prototype.wasAdoptedBy = function () {
      throw new Error('must be hosted by a chain to be in the world tree');
    };

    _Class.prototype.toString = function () {
      var pt1, pt2;
      pt1 = "{x: " + this.point1.x + ", y: " + this.point1.y + "}";
      pt2 = "{x: " + this.point2.x + ", y: " + this.point2.y + "}";
      return "Platter.geom.ChainLink#" + this.id + "(" + pt1 + ", " + pt2 + ")";
    };

    return _Class;
  })(_Line['default'].ctor));

  exports.methods = methods = {
    typeGroup: {
      finalize: function finalize() {
        _line.methods.typeGroup.finalize.call(this);
        return this.type.push(_type.chainLink);
      }
    }
  };

  for (k in _spaceNode.methods) {
    v = _spaceNode.methods[k];
    chainLinkFactory.method(k, v);
  }

  for (k in _primative.methods) {
    v = _primative.methods[k];
    chainLinkFactory.method(k, v);
  }

  for (k in _line.methods) {
    v = _line.methods[k];
    if (k !== 'typeGroup') {
      chainLinkFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    chainLinkFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = chainLinkFactory;
});
