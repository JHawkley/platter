define(['exports', '../factory/base', '../space/node', './line', './primative'], function (exports, _factoryBase, _spaceNode, _line, _primative) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_spaceNode);

  var _Line = _interopRequireDefault(_line);

  var chainLinkFactory,
      k,
      methods,
      typeGroup,
      v,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  exports.type = typeGroup = _Node['default'].addType('chain-link');

  chainLinkFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

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

    function _Class(host) {
      _Class.__super__.constructor.call(this);
      if (host == null) {
        throw new Error('a chain-link requires a chain to host it');
      }
      this._instanceData = {
        host: host
      };
      Object.freeze(this._instanceData);
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
      pt1 = '{x: ' + this.point1.x + ', y: ' + this.point1.y + '}';
      pt2 = '{x: ' + this.point2.x + ', y: ' + this.point2.y + '}';
      return 'Platter.geom.ChainLink#' + this.id + '(' + pt1 + ', ' + pt2 + ')';
    };

    return _Class;
  })(_Line['default'].ctor));

  exports.methods = methods = {
    type: {
      finalize: function finalize() {
        _line.methods.type.finalize.call(this);
        return this.type |= typeGroup;
      }
    }
  };

  for (k in _primative.methods) {
    v = _primative.methods[k];
    chainLinkFactory.method(k, v);
  }

  for (k in _line.methods) {
    v = _line.methods[k];
    if (k !== 'type') {
      chainLinkFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    chainLinkFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = typeGroup;
  exports['default'] = chainLinkFactory;
});
