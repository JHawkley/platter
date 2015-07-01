define(['exports', 'module', '../math/matrix', '../utils/lowest-common-ancestor'], function (exports, module, _mathMatrix, _utilsLowestCommonAncestor) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Matrix = _interopRequireDefault(_mathMatrix);

  var _lowestCommonAncestor = _interopRequireDefault(_utilsLowestCommonAncestor);

  var Node, curTypeShift, recurse, wm;

  wm = new _Matrix['default']();

  recurse = function (node, stopAt, fn) {
    if (node == null) {
      if (stopAt != null) {
        throw new Error('expected to find `stopAt` as an ancestor, but did not');
      }
    } else if (node === stopAt || recurse(node.parent, stopAt, fn) !== false) {
      return fn(node);
    }
  };

  curTypeShift = 0;

  Node = (function () {
    Node.types = {};

    Node.addType = function (type) {
      var base;
      if ((base = Node.types)[type] == null) {
        base[type] = 1 << curTypeShift++;
      }
      if (curTypeShift > 30) {
        throw new Error('too many node types');
      }
      return Node.types[type];
    };

    Object.defineProperty(Node.prototype, 'parent', {
      get: function get() {
        return this._parent;
      },
      set: function set(val) {
        var ref;
        if (val === this._parent) {
          return;
        }
        if ((ref = this._parent) != null) {
          ref.orphanObj(this);
        }
        return val != null ? val.adoptObj(this) : void 0;
      }
    });

    Object.defineProperty(Node.prototype, 'type', {
      get: function get() {
        var ref;
        return (ref = this._data.type) != null ? ref : 0;
      }
    });

    function Node(x, y) {
      this.x = x;
      this.y = y;
      this._parent = null;
    }

    Node.prototype.destroy = function () {
      if (this._parent != null) {
        throw new Error('cannot be destroyed while still adopted by a group');
      }
    };

    Node.prototype.iterateUpToRoot = function (fn) {
      var parent;
      parent = this.parent;
      while (parent != null) {
        if (fn(parent) === false) {
          return;
        }
        parent = parent.parent;
      }
    };

    Node.prototype.iterateDownFromRoot = function (fn) {
      return recurse(this.parent, null, fn);
    };

    Node.prototype.iterateDownFrom = function (ancestor, fn) {
      return recurse(this.parent, ancestor, fn);
    };

    Node.prototype.wasAdoptedBy = function (group) {
      if (this._parent != null) {
        throw new Error('already adopted by another group');
      }
      return this._parent = group;
    };

    Node.prototype.wasOrphanedBy = function (group) {
      if (this._parent !== group) {
        throw new Error('can only be orphaned by the node\'s current parent');
      }
      return this._parent = null;
    };

    Node.prototype.attach = function (group) {
      return this.parent = group;
    };

    Node.prototype.detach = function () {
      return this.parent = null;
    };

    Node.prototype.lift = function () {
      var target;
      wm.reset();
      target = null;
      this.iterateDownFromRoot(function (anc) {
        if (target != null) {
          wm.translate(anc.x, anc.y);
        } else {
          target = anc;
        }
      });
      this.parent = target;
      wm.applyToPoint(this);
      return this;
    };

    Node.prototype.liftOut = function () {
      wm.reset();
      this.iterateDownFromRoot(function (anc) {
        return wm.translate(anc.x, anc.y);
      });
      this.parent = null;
      wm.applyToPoint(this);
      return this;
    };

    Node.prototype.liftTo = function (ancestor) {
      wm.reset();
      this.iterateDownFrom(ancestor, function (anc) {
        if (anc === ancestor) {
          return;
        }
        return wm.translate(anc.x, anc.y);
      });
      this.parent = ancestor;
      wm.applyToPoint(this);
      return this;
    };

    Node.prototype.dropInto = function (descendant) {
      var parent;
      wm.reset();
      parent = this.parent;
      descendant.iterateDownFrom(parent, function (anc) {
        if (anc === parent) {
          return;
        }
        return wm.translate(anc.x, anc.y);
      });
      wm.translate(descendant.x, descendant.y);
      wm.inverse();
      this.parent = descendant;
      wm.applyToPoint(this);
      return this;
    };

    Node.prototype.jumpInto = function (group) {
      var lca;
      lca = (0, _lowestCommonAncestor['default'])(this, group);
      if (lca == null) {
        throw new Error('cannot jump into a node from another tree');
      }
      this.liftTo(lca);
      return this.dropInto(group);
    };

    Node.prototype.toString = function () {
      return 'Platter.space.Node#' + this.id + '({x: ' + this.x + ', y: ' + this.y + '})';
    };

    return Node;
  })();

  module.exports = Node;
});
