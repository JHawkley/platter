define(['exports', 'module', '../utils/es6'], function (exports, module, _utilsEs6) {
  'use strict';

  var TOIIsland;

  TOIIsland = (function () {
    var id, pool;

    id = 0;

    pool = [];

    TOIIsland.create = function (a, b) {
      var instance, ref;
      instance = (ref = pool.pop()) != null ? ref : new TOIIsland();
      return TOIIsland.init(instance, a, b);
    };

    TOIIsland.releaseList = function (island) {
      var n, next, p, prev;
      prev = island.prev, next = island.next;
      while (prev != null) {
        p = prev.prev;
        prev.release();
        prev = p;
      }
      while (next != null) {
        n = next.next;
        next.release();
        next = n;
      }
      return this.release();
    };

    TOIIsland.reclaim = function (instance) {
      return pool.push(instance);
    };

    TOIIsland.init = function (instance, a, b) {
      if (a != null) {
        instance.add(a);
      }
      if (b != null) {
        instance.add(b);
      }
      return instance;
    };

    TOIIsland.prototype[_utilsEs6.iteratorSymbol] = function () {
      var result;
      result = {
        value: null,
        done: false
      };
      return {
        next: (function (_this) {
          return function () {
            var next;
            if (result.value != null) {
              next = result.value.next;
              if (next != null) {
                result.value = next;
                result.done = false;
              } else {
                result.value = null;
                result.done = true;
              }
            } else if (!result.done) {
              result.value = _this;
            }
            return result;
          };
        })(this)
      };
    };

    function TOIIsland() {
      this.members = [];
      this.id = id++;
      this.next = null;
      this.prev = null;
    }

    TOIIsland.prototype.add = function (candidate, force) {
      if (force == null) {
        force = false;
      }
      if (candidate.island != null) {
        if (candidate.island === this) {
          return;
        }
        if (force !== true) {
          throw new Error('candidate is already a member of another island');
        }
      }
      candidate.island = this;
      this.members.push(candidate);
      return this;
    };

    TOIIsland.prototype.absorb = function (other) {
      var candidate, i, len, ref;
      ref = other.members;
      for (i = 0, len = ref.length; i < len; i++) {
        candidate = ref[i];
        this.add(candidate, true);
      }
      other.members.length = 0;
      other.cutOut();
      return this;
    };

    TOIIsland.prototype.cutOut = function () {
      var next, prev;
      next = this.next, prev = this.prev;
      if (prev != null) {
        prev.next = next;
      }
      if (next != null) {
        next.prev = prev;
      }
      this.next = null;
      return this.prev = null;
    };

    TOIIsland.prototype.release = function () {
      var i, len, member, ref;
      ref = this.members;
      for (i = 0, len = ref.length; i < len; i++) {
        member = ref[i];
        member.island = null;
      }
      this.members.length = 0;
      return TOIIsland.reclaim(this);
    };

    return TOIIsland;
  })();

  module.exports = TOIIsland;
});
