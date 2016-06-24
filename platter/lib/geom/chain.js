define(['exports', '../factory/base', '../callback/type', './primative', '../space/node', './chain-link', '../utils/find-bounds', '../utils/es6', '../utils/array', './_type'], function (exports, _factoryBase, _callbackType, _primative, _spaceNode, _chainLink, _utilsFindBounds, _utilsEs6, _utilsArray, _type) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _CallbackType = _interopRequireDefault(_callbackType);

  var _Primative = _interopRequireDefault(_primative);

  var _ChainLink = _interopRequireDefault(_chainLink);

  var _findBounds = _interopRequireDefault(_utilsFindBounds);

  var chainFactory,
      comparePoints,
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
      hasProp = ({}).hasOwnProperty,
      slice = [].slice;

  comparePoints = function (pt1, pt2) {
    switch (false) {
      case !!(pt1 != null && pt2 != null):
        return false;
      case pt1.x === pt2.x:
        return false;
      case pt1.y === pt2.y:
        return false;
      default:
        return true;
    }
  };

  chainFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance) {
      var curLink, firstLink, gen, instanceData, j, len, links, nextHash, prevHash, prevLink, ref1;
      nextHash = {};
      prevHash = {};
      links = [];
      prevLink = null;
      curLink = null;
      ref1 = instance._data.links;
      for (j = 0, len = ref1.length; j < len; j++) {
        gen = ref1[j];
        curLink = gen.create(instance);
        if (prevLink != null) {
          prevHash[curLink.id] = prevLink;
          nextHash[prevLink.id] = curLink;
        }
        links.push(curLink);
        prevLink = curLink;
      }
      if (instance._data.closed) {
        firstLink = links[0];
        prevHash[firstLink.id] = curLink;
        nextHash[curLink.id] = firstLink;
      }
      Object.freeze(prevHash);
      Object.freeze(nextHash);
      Object.freeze(links);
      instanceData = {
        links: links,
        prevHash: prevHash,
        nextHash: nextHash
      };
      Object.freeze(instanceData);
      return instance._instanceData = instanceData;
    };

    Object.defineProperty(_Class.prototype, 'x', {
      get: function get() {
        return this._data.rect.x;
      }
    });

    Object.defineProperty(_Class.prototype, 'y', {
      get: function get() {
        return this._data.rect.y;
      }
    });

    Object.defineProperty(_Class.prototype, 'links', {
      get: function get() {
        return this._instanceData.links;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
    }

    _Class.prototype.destroy = function () {
      var j, len, link, ref1;
      ref1 = this._instanceData.links;
      for (j = 0, len = ref1.length; j < len; j++) {
        link = ref1[j];
        link.release();
      }
      this._instanceData = null;
      return _Class.__super__.destroy.call(this);
    };

    _Class.prototype.support = function () {
      throw new Error('not supported');
    };

    _Class.prototype[_utilsEs6.iteratorSymbol] = function () {
      var links, nextIndex, results;
      nextIndex = 0;
      links = this.links;
      results = {};
      return {
        next: function next() {
          switch (nextIndex) {
            case links.length:
              results.value = void 0;
              results.done = true;
              break;
            default:
              results.value = links[nextIndex++];
              results.done = false;
          }
          return results;
        }
      };
    };

    _Class.prototype.getNext = function (ref) {
      return this._instanceData.nextHash[ref.id];
    };

    _Class.prototype.getPrev = function (ref) {
      return this._instanceData.prevHash[ref.id];
    };

    _Class.prototype.toRect = function (out) {
      out.set(this._data.rect);
      return out;
    };

    _Class.prototype.toString = function () {
      return "Platter.geom.Chain#" + this.id + "({links.length: " + this.links.length + "})";
    };

    return _Class;
  })(_Primative['default']));

  exports.methods = methods = {
    points: {
      init: function init() {
        return this.points = [];
      },
      apply: function apply() {
        var j, len, point, points;
        if (this.closed) {
          throw new Error('cannot add points to a closed shape');
        }
        points = (0, _utilsArray.isArray)(arguments[0]) ? arguments[0] : arguments;
        for (j = 0, len = points.length; j < len; j++) {
          point = points[j];
          this.points.push(point);
        }
      },
      finalize: function finalize() {
        var curPoint, i, lastPoint;
        lastPoint = null;
        i = 0;
        while (i < this.points.length) {
          curPoint = this.points[i];
          if (comparePoints(lastPoint, curPoint)) {
            this.points.splice(i, 1);
          } else {
            i += 1;
          }
          lastPoint = curPoint;
        }
        if (this.points.length <= 1) {
          throw new Error('not enough points to create a single chain');
        }
        if (this.closed && this.points.length <= 3) {
          throw new Error('not a closed polygon; more a line or point');
        }
      },
      seal: function seal() {
        var j, len, point, ref1;
        ref1 = this.points;
        for (j = 0, len = ref1.length; j < len; j++) {
          point = ref1[j];
          Object.freeze(point);
        }
        return Object.freeze(this.points);
      }
    },
    add: {
      apply: function apply() {
        var ref1, x, y;
        if (this.closed) {
          throw new Error('cannot add points to a closed shape');
        }
        switch (arguments.length) {
          case 1:
            ref1 = arguments[0], x = ref1.x, y = ref1.y;
            break;
          case 2:
            x = arguments[0], y = arguments[1];
            break;
          default:
            throw new Error('invalid arguments');
        }
        return this.points.push({
          x: x,
          y: y
        });
      }
    },
    close: {
      init: function init() {
        return this.closed = false;
      },
      apply: function apply() {
        var _, firstPoint, j, lastPoint, points;
        if (this.closed) {
          throw new Error('already closed the shape');
        }
        points = this.points;
        firstPoint = points[0], _ = 3 <= points.length ? slice.call(points, 1, j = points.length - 1) : (j = 1, []), lastPoint = points[j++];
        switch (false) {
          case !comparePoints(firstPoint, lastPoint):
            if (points.length <= 3) {
              throw new Error('not a closed polygon; more a line or point');
            }
            break;
          default:
            if (points.length <= 2) {
              throw new Error('not enough points to create a closed polygon');
            }
            points.push(firstPoint);
        }
        return this.closed = true;
      },
      finalize: function finalize() {
        var _, firstPoint, j, lastPoint, ref1;
        if (this.closed) {
          return;
        }
        ref1 = this.points, firstPoint = ref1[0], _ = 3 <= ref1.length ? slice.call(ref1, 1, j = ref1.length - 1) : (j = 1, []), lastPoint = ref1[j++];
        if (comparePoints(firstPoint, lastPoint)) {
          if (this.points.length <= 3) {
            throw new Error('not a closed polygon; more a line or point');
          }
          return this.closed = true;
        }
      }
    },
    reverse: {
      init: function init() {
        return this.reversed = false;
      },
      apply: function apply() {
        return this.reversed = true;
      }
    },
    links: {
      init: function init() {
        return this.links = [];
      },
      seal: function seal() {
        var curPoint, generator, j, lastPoint, len, links, offX, offY, ref1, ref2;
        offX = this.x, offY = this.y;
        links = this.links;
        lastPoint = null;
        ref2 = this.points;
        ref1 = this.reversed ? -1 : 1;
        for (ref1 > 0 ? (j = 0, len = ref2.length) : j = ref2.length - 1; ref1 > 0 ? j < len : j >= 0; j += ref1) {
          curPoint = ref2[j];
          if (lastPoint != null) {
            generator = _ChainLink['default'].define().translate(offX, offY).points(lastPoint, curPoint).type(this.chainType).seal();
            links.push(generator);
          }
          lastPoint = curPoint;
        }
        delete this.chainType;
        return Object.freeze(links);
      }
    },
    rectangle: {
      finalize: function finalize() {
        var bottom, j, left, len, point, ref1, right, top, x, y;
        top = left = Number.POSITIVE_INFINITY;
        bottom = right = Number.NEGATIVE_INFINITY;
        ref1 = this.points;
        for (j = 0, len = ref1.length; j < len; j++) {
          point = ref1[j];
          x = point.x, y = point.y;
          top = Math.min(top, y);
          left = Math.min(left, x);
          bottom = Math.max(bottom, y);
          right = Math.max(right, x);
        }
        return this.rect = {
          x: left + this.x,
          y: top + this.y,
          width: right - left,
          height: bottom - top
        };
      },
      seal: function seal() {
        return Object.freeze(this.rect);
      }
    },
    type: {
      init: function init() {
        _spaceNode.methods.type.init.call(this);
        return this.chainType = [];
      },
      apply: function apply(cbType) {
        var ref1;
        _spaceNode.methods.type.apply.call(this, cbType);
        if ((0, _utilsArray.isArray)(cbType)) {
          return (ref1 = this.chainType).push.apply(ref1, cbType);
        } else {
          return this.chainType.push(cbType);
        }
      },
      seal: function seal() {
        return _spaceNode.methods.type.seal.call(this);
      }
    },
    typeGroup: {
      finalize: function finalize() {
        return this.type.push(_type.chain);
      }
    }
  };

  for (k in _spaceNode.methods) {
    v = _spaceNode.methods[k];
    if (k !== 'type') {
      chainFactory.method(k, v);
    }
  }

  for (k in _primative.methods) {
    v = _primative.methods[k];
    chainFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    chainFactory.method(k, v);
  }

  exports.methods = methods;
  exports.type = _type.chain;
  exports['default'] = chainFactory;
});
