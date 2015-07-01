define(['exports', '../factory/base', '../space/node', './primative', './chain-link', '../utils/find-bounds', '../utils/es6'], function (exports, _factoryBase, _spaceNode, _primative, _chainLink, _utilsFindBounds, _utilsEs6) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Node = _interopRequireDefault(_spaceNode);

  var _Primative = _interopRequireDefault(_primative);

  var _ChainLink = _interopRequireDefault(_chainLink);

  var _findBounds = _interopRequireDefault(_utilsFindBounds);

  var chainFactory,
      comparePoints,
      isArray,
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
      hasProp = ({}).hasOwnProperty,
      slice = [].slice;

  isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

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

  typeGroup = _Node['default'].addType('chain');

  chainFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

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
      var curLink, firstLink, gen, j, len, links, nextHash, prevHash, prevLink, ref1;
      _Class.__super__.constructor.call(this);
      nextHash = {};
      prevHash = {};
      links = [];
      prevLink = null;
      curLink = null;
      ref1 = this._data.links;
      for (j = 0, len = ref1.length; j < len; j++) {
        gen = ref1[j];
        curLink = gen.create(this);
        if (prevLink != null) {
          prevHash[curLink.id] = prevLink;
          nextHash[prevLink.id] = curLink;
        }
        links.push(curLink);
        prevLink = curLink;
      }
      if (this._data.closed) {
        firstLink = links[0];
        prevHash[firstLink.id] = curLink;
        nextHash[curLink.id] = firstLink;
      }
      Object.freeze(prevHash);
      Object.freeze(nextHash);
      Object.freeze(links);
      this._instanceData = {
        links: links,
        prevHash: prevHash,
        nextHash: nextHash
      };
      Object.freeze(this._instanceData);
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

    _Class.prototype[_utilsEs6.iteratorSymbol] = function () {
      var links, nextIndex;
      nextIndex = 0;
      links = this.links;
      return {
        next: function next() {
          switch (nextIndex) {
            case links.length:
              return {
                value: void 0,
                done: true
              };
            default:
              return {
                value: links[nextIndex++],
                done: false
              };
          }
        }
      };
    };

    _Class.prototype.getNext = function (ref) {
      return this._instanceData.nextHash[ref.id];
    };

    _Class.prototype.getPrev = function (ref) {
      return this._instanceData.prevHash[ref.id];
    };

    _Class.prototype.toRect = function () {
      return this._data.rect;
    };

    _Class.prototype.toString = function () {
      return 'Platter.geom.Chain#' + this.id + '({links.length: ' + this.links.length + '})';
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
        points = isArray(arguments[0]) ? arguments[0] : arguments;
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
    links: {
      init: function init() {
        return this.links = [];
      },
      seal: function seal() {
        var curPoint, generator, j, lastPoint, len, links, offX, offY, ref1;
        offX = this.x, offY = this.y;
        links = this.links;
        lastPoint = null;
        ref1 = this.points;
        for (j = 0, len = ref1.length; j < len; j++) {
          curPoint = ref1[j];
          if (lastPoint != null) {
            generator = _ChainLink['default'].define().translate(offX, offY).points(lastPoint, curPoint).group(this.filter.group).mask(this.filter.mask).seal();
            links.push(generator);
          }
          lastPoint = curPoint;
        }
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
      finalize: function finalize() {
        return this.type = typeGroup;
      }
    }
  };

  for (k in _primative.methods) {
    v = _primative.methods[k];
    chainFactory.method(k, v);
  }

  for (k in methods) {
    v = methods[k];
    chainFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = chainFactory;
});
