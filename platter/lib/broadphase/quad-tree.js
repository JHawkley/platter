define(['exports', 'module', '../math/rect'], function (exports, module, _mathRect) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Rect = _interopRequireDefault(_mathRect);

  var QuadTree, pool, quadBL, quadBR, quadNone, quadTL, quadTR, workingRect;

  workingRect = _Rect['default'].create();

  quadNone = 0;

  quadTL = 1 << 0;

  quadTR = 1 << 1;

  quadBL = 1 << 2;

  quadBR = 1 << 3;

  pool = [];

  QuadTree = (function () {
    QuadTree.FLAGS = {
      quadNone: quadNone,
      quadTL: quadTL,
      quadTR: quadTR,
      quadBL: quadBL,
      quadBR: quadBR
    };

    QuadTree.create = function (x, y, w, h, maxObjects, maxLevels, level) {
      var instance, ref;
      instance = (ref = pool.pop()) != null ? ref : new QuadTree();
      return QuadTree.init(instance, x, y, w, h, maxObjects, maxLevels, level);
    };

    QuadTree.reclaim = function (instance) {
      return pool.push(instance);
    };

    QuadTree.init = function (instance, x, y, w, h, maxObjects, maxLevels, level) {
      var ref;
      if (typeof x !== 'number') {
        maxObjects = y;
        maxLevels = w;
        level = h;
        ref = x, x = ref.x, y = ref.y, w = ref.width, h = ref.height;
      }
      instance.maxObjects = maxObjects != null ? maxObjects : 10;
      instance.maxLevels = maxLevels != null ? maxLevels : 4;
      instance.level = level != null ? level : 0;
      instance.bounds.setProps(x, y, w, h);
      return instance;
    };

    function QuadTree() {
      this.objects = [];
      this.nodes = null;
      this.bounds = _Rect['default'].create();
    }

    QuadTree.prototype.split = function () {
      var height, lev, ml, mo, nodes, ref, width, x, y;
      lev = this.level + 1;
      mo = this.maxObjects;
      ml = this.maxLevels;
      ref = this.bounds, x = ref.x, y = ref.y, width = ref.width, height = ref.height;
      x = Math.round(x);
      y = Math.round(y);
      width = Math.round(width / 2);
      height = Math.round(height / 2);
      nodes = {};
      nodes[quadTL] = QuadTree.create(x, y, width, height, mo, ml, lev);
      nodes[quadTR] = QuadTree.create(x + width, y, width, height, mo, ml, lev);
      nodes[quadBL] = QuadTree.create(x, y + height, width, height, mo, ml, lev);
      nodes[quadBR] = QuadTree.create(x + width, y + height, width, height, mo, ml, lev);
      this.nodes = nodes;
    };

    QuadTree.prototype.getQuads = function (object) {
      var h, hm, leftQuadrant, quads, rect, ref, rightQuadrant, vm, w, x, y;
      rect = (ref = typeof object.toRect === "function" ? object.toRect(workingRect) : void 0) != null ? ref : object;
      quads = quadNone;
      vm = this.bounds.x + this.bounds.width / 2;
      hm = this.bounds.y + this.bounds.height / 2;
      x = rect.x, y = rect.y, w = rect.width, h = rect.height;
      leftQuadrant = x <= vm;
      rightQuadrant = x + w >= vm;
      if (y <= hm) {
        if (leftQuadrant) {
          quads |= quadTL;
        }
        if (rightQuadrant) {
          quads |= quadTR;
        }
      }
      if (y + h >= hm) {
        if (leftQuadrant) {
          quads |= quadBL;
        }
        if (rightQuadrant) {
          quads |= quadBR;
        }
      }
      return quads;
    };

    QuadTree.prototype.insert = function (object) {
      var i, quads;
      if (this.nodes != null) {
        quads = this.getQuads(object);
        if (quads === quadTL || quads === quadTR || quads === quadBL || quads === quadBR) {
          this.nodes[quads].insert(object);
          return;
        }
      }
      this.objects.push(object);
      if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
        if (this.nodes == null) {
          this.split();
        }
        i = 0;
        while (i < this.objects.length) {
          quads = this.getQuads(this.objects[i]);
          if (quads === quadTL || quads === quadTR || quads === quadBL || quads === quadBR) {
            this.nodes[quads].insert(this.objects.splice(i, 1)[0]);
          } else {
            i += 1;
          }
        }
      }
    };

    QuadTree.prototype.retrieve = function (object) {
      var arrs, node, q, quads, ref, ref1;
      arrs = [this.objects];
      if (this.nodes != null) {
        quads = this.getQuads(object);
        ref = this.nodes;
        for (q in ref) {
          node = ref[q];
          if (quads & q) {
            arrs.push(node.retrieve(object));
          }
        }
      }
      return (ref1 = Array.prototype.concat).call.apply(ref1, arrs);
    };

    QuadTree.prototype.release = function () {
      this.clear();
      return QuadTree.reclaim(this);
    };

    QuadTree.prototype.reset = function (bounds) {
      this.clear();
      this.bounds.x = bounds.x;
      this.bounds.y = bounds.y;
      this.bounds.width = bounds.width;
      return this.bounds.height = bounds.height;
    };

    QuadTree.prototype.clear = function () {
      var k, node, ref;
      this.objects = [];
      if (this.nodes != null) {
        ref = this.nodes;
        for (k in ref) {
          node = ref[k];
          node.release();
        }
      }
      return this.nodes = null;
    };

    QuadTree.prototype.toString = function () {
      var indent, j, len, node, object, parts, quad, ref, ref1, str;
      indent = new Array(this.level + 1).join('  ');
      parts = [];
      parts.push("Quad-Tree (level " + this.level + ")");
      parts.push('-Objects-');
      if (this.objects.length > 0) {
        ref = this.objects;
        for (j = 0, len = ref.length; j < len; j++) {
          object = ref[j];
          parts.push(object.toString());
        }
      } else {
        parts.push('(empty)');
      }
      parts.push('');
      parts.push('--Nodes--');
      if (this.nodes != null) {
        str = parts.map(function (part) {
          return indent + part;
        }).join('\r\n');
        ref1 = this.nodes;
        for (quad in ref1) {
          node = ref1[quad];
          str += '\r\n';
          str += (function () {
            switch (Number(quad)) {
              case quadTL:
                return indent + '@ top-left\r\n';
              case quadTR:
                return indent + '@ top-right\r\n';
              case quadBL:
                return indent + '@ bottom-left\r\n';
              case quadBR:
                return indent + '@ bottom-right\r\n';
            }
          })();
          str += node.toString();
        }
      } else {
        parts.push('(empty)');
        parts.push('');
        str = parts.map(function (part) {
          return indent + part;
        }).join('\r\n');
      }
      return str;
    };

    return QuadTree;
  })();

  module.exports = QuadTree;
});
