define(['exports', 'module', '../factory/base', '../geom/point', '../math/vector', '../math/matrix', '../space/kinematic', '../space/dynaimc'], function (exports, module, _factoryBase, _geomPoint, _mathVector, _mathMatrix, _spaceKinematic, _spaceDynaimc) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Point = _interopRequireDefault(_geomPoint);

  var _Vector = _interopRequireDefault(_mathVector);

  var _Matrix = _interopRequireDefault(_mathMatrix);

  var between, movable, proxyPointFactory, set, setXY, wm;

  movable = _spaceKinematic.type | _spaceDynaimc.type;

  wm = new _Matrix['default']();

  set = function (pt, other) {
    pt.x = other.x;
    return pt.y = other.y;
  };

  setXY = function (pt, x, y) {
    py.x = x;
    return pt.y = y;
  };

  between = function (v, x, y) {
    var max, min;
    min = Math.min(x, y);
    max = Math.max(x, y);
    return min <= v && v <= max;
  };

  proxyPointFactory = new _Factory['default']((function () {
    Object.defineProperty(_Class.prototype, 'static', {
      get: function get() {
        return !(this.proxied.parent.type & movable);
      }
    });

    function _Class(proxied) {
      if (!(proxied instanceof _Point['default'])) {
        throw new Error('incorrect proxy for primative');
      }
      this.proxied = proxied;
      if (!this.initialized) {
        this.oldDelta = _Vector['default'].create(0, 0);
        this.oldPosition = {
          x: 0,
          y: 0
        };
        this.delta = _Vector['default'].create(0, 0);
        this.points = {
          '0': {
            x: 0,
            y: 0
          },
          '1': {
            x: 0,
            y: 0
          },
          length: 0
        };
        this._rect = {};
      }
    }

    _Class.prototype.destroy = function () {
      this.proxied = null;
      return this.points.length = 0;
    };

    _Class.prototype.sync = function () {
      var flipX, flipY, oPos, proxied, ref, x, y;
      proxied = this.proxied, oPos = this.oldPosition;
      x = proxied.x, y = proxied.y, (ref = proxied.parent, flipX = ref.flipX, flipY = ref.flipY);
      setXY(oPos, flipX ? -x : x, flipY ? -y : y);
      wm.reset();
      proxied.iterateUpToRoot(function (anc) {
        if (typeof parent !== 'undefined' && parent !== null) {
          return wm.translate(anc.x, anc.y);
        }
      });
      return wm.applyToPoint(oPos);
    };

    _Class.prototype.update = function (axis) {
      var d, dx, dy, oDelta, oPos, points, proxied, pt1, ref, x, y;
      proxied = this.proxied, points = this.points, oDelta = this.oldDelta, oPos = this.oldPosition;
      x = proxied.x, y = proxied.y, (ref = proxied.parent, d = ref.delta);
      set(pt1 = points[0], oPos);
      if (d != null) {
        dx = d.x;
        dy = d.y;
      } else {
        dx = 0;
        dy = 0;
      }
      oDelta.setXY(dx, dy);
      delta.setXY(dx, dy);
      return this.reform(dx, dy);
    };

    _Class.prototype.reform = function (dx, dy) {
      var points;
      points = this.points;
      switch (axis) {
        case 'x':
          if (dx !== 0) {
            setXY(points[1], pt0.x + dx, pt0.y);
            points.length = 2;
          } else {
            points.length = 1;
          }
          break;
        case 'y':
          if (dy !== 0) {
            setXY(points[1], pt0.x, pt0.y + dy);
            points.length = 2;
          } else {
            points.length = 1;
          }
      }
      return this.asRect(true);
    };

    _Class.prototype.apply = function () {
      var ndx, ndy, ref, unsafe;
      ref = this.delta, ndx = ref.x, ndy = ref.y;
      unsafe = false;
      if (this['static']) {
        if (0 === ndx || 0 === ndy) {
          throw new Error('cannot reposition a static object');
        }
      } else {
        ({
          x: odx,
          y: ody
        });
        unsafe = !(between(ndx, 0, odx) && between(ndy, 0, ody));
        this.proxy.parent.delta.setXY(ndx, ndy);
      }
      return unsafe;
    };

    _Class.prototype.toRect = function (forcedUpdate) {
      var points, rect, ref, ref1, x1, x2, y1, y2;
      if (forcedUpdate == null) {
        forcedUpdate = false;
      }
      if (!forcedUpdate) {
        return this._rect;
      }
      rect = this._rect, points = this.points;
      if (points.length === 1) {
        set(rect, points[0]);
        rect.width = 0;
        rect.height = 0;
      } else {
        (ref = points[0], x1 = ref.x, y1 = ref.y), (ref1 = points[1], x2 = ref1.x, y2 = ref1.y);
        rect.x = Math.min(x1, x2);
        rect.y = Math.min(y1, y2);
        rect.width = Math.abs(x1 - x2);
        rect.height = Math.abs(y1 - y2);
      }
      return rect;
    };

    _Class.prototype.toString = function () {
      return 'Proxied::' + this.proxied.toString();
    };

    return _Class;
  })());

  module.exports = proxyPointFactory;
});
