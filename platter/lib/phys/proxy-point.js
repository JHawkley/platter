define(['exports', 'module', '../factory/base', './proxy-base', '../geom/_support', '../math/matrix', '../math/vector-math'], function (exports, module, _factoryBase, _proxyBase, _geom_support, _mathMatrix, _mathVectorMath) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Proxy = _interopRequireDefault(_proxyBase);

  var _Matrix = _interopRequireDefault(_mathMatrix);

  var max,
      min,
      proxyPointFactory,
      wm,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  min = Math.min, max = Math.max;

  wm = new _Matrix['default']();

  proxyPointFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.transform = function () {
      var flipX, flipY, oPos, proxied, ref, sPos, x, y;
      proxied = this.proxied, oPos = this.oldPosition, sPos = this.syncPosition;
      x = proxied.x, y = proxied.y, (ref = proxied.parent, flipX = ref.flipX, flipY = ref.flipY);
      (0, _mathVectorMath.setXY)(oPos, flipX ? -x : x, flipY ? -y : y);
      wm.reset();
      proxied.iterateUpToRoot(function (anc) {
        if (anc.parent != null) {
          return wm.translate(anc.x, anc.y);
        }
      });
      wm.applyToPoint(oPos);
      return (0, _mathVectorMath.set)(sPos, oPos);
    };

    _Class.prototype.support = function (out, v) {
      return (0, _geom_support.point)(out, this, v);
    };

    _Class.prototype.toRect = function (out, synced) {
      var i, len, maxX, maxY, minX, minY, node, nodes, ref, ref1, ref2, ref3, x, y;
      if (synced == null) {
        synced = false;
      }
      if (synced) {
        ref = this.syncPosition, x = ref.x, y = ref.y;
        out.setProps(x, y, 0, 0);
      } else {
        nodes = this.delta.nodes;
        if (nodes.length > 0) {
          if (nodes[0].pos === 0.0) {
            minX = minY = Number.POSITIVE_INFINITY;
            maxX = maxY = Number.NEGATIVE_INFINITY;
          } else {
            minX = maxX = minY = maxY = 0;
          }
          for (i = 0, len = nodes.length; i < len; i++) {
            node = nodes[i];
            ref1 = node.value, x = ref1.x, y = ref1.y;
            minX = min(minX, x);
            maxX = max(maxX, x);
            minY = min(minY, y);
            maxY = max(maxY, y);
          }
          ref2 = this.oldPosition, x = ref2.x, y = ref2.y;
          out.setProps(minX + x, minY + y, maxX - minX, maxY - minY);
        } else {
          ref3 = this.oldPosition, x = ref3.x, y = ref3.y;
          out.setProps(x, y, 0, 0);
        }
      }
      return out;
    };

    return _Class;
  })(_Proxy['default']));

  module.exports = proxyPointFactory;
});
