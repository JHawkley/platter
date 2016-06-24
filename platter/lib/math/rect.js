define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var ImmutableRect,
      Rect,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  exports.MutableRect = Rect = (function () {
    Rect.init = function (instance, x, y, w, h) {
      instance.x = x != null ? x : 0;
      instance.y = y != null ? y : 0;
      instance.width = w != null ? w : 0;
      return instance.height = h != null ? h : 0;
    };

    Rect.create = function (x, y, w, h) {
      return new Rect(x, y, w, h);
    };

    Rect.reclaim = function (obj) {};

    Rect.prototype.release = function () {
      return Rect.reclaim(this);
    };

    Object.defineProperty(Rect.prototype, 'left', {
      get: function get() {
        return this.x;
      },
      enumerable: true
    });

    Object.defineProperty(Rect.prototype, 'top', {
      get: function get() {
        return this.y;
      },
      enumerable: true
    });

    Object.defineProperty(Rect.prototype, 'right', {
      get: function get() {
        return this.x + this.width;
      },
      enumerable: true
    });

    Object.defineProperty(Rect.prototype, 'bottom', {
      get: function get() {
        return this.y + this.height;
      },
      enumerable: true
    });

    function Rect(x, y, w, h) {
      Rect.init(this, x, y, w, h);
    }

    Rect.prototype.set = function (other) {
      this.x = other.x;
      this.y = other.y;
      this.width = other.width;
      this.height = other.height;
      return this;
    };

    Rect.prototype.setProps = function (x, y, w, h) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
      return this;
    };

    Rect.prototype.copy = function () {
      return Rect.create(this.x, this.y, this.width, this.height);
    };

    Rect.prototype.asMutable = function () {
      return Rect.create(this.x, this.y, this.width, this.height);
    };

    Rect.prototype.asImmutable = function () {
      return ImmutableRect.create(this.x, this.y, this.width, this.height);
    };

    Rect.prototype.toRect = function (out) {
      out.set(this);
      return out;
    };

    Rect.prototype.toString = function () {
      var str;
      str = "{x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + "}";
      return "Platter.math.MutableRect(" + str + ")";
    };

    return Rect;
  })();

  exports.ImmutableRect = ImmutableRect = (function (superClass) {
    extend(ImmutableRect, superClass);

    ImmutableRect.create = function (x, y, w, h) {
      return new ImmutableRect(x, y, w, h);
    };

    ImmutableRect.reclaim = function () {};

    ImmutableRect.prototype.release = function () {};

    function ImmutableRect(x, y, w, h) {
      ImmutableRect.__super__.constructor.call(this, x, y, w, h);
      Object.freeze(this);
    }

    ImmutableRect.prototype.set = function () {
      throw new Error('rect is immutable');
    };

    ImmutableRect.prototype.setProps = function () {
      throw new Error('rect is immutable');
    };

    ImmutableRect.prototype.copy = function () {
      return this;
    };

    ImmutableRect.prototype.asImmutable = function () {
      return this;
    };

    ImmutableRect.prototype.toString = function () {
      var str;
      str = "{x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + "}";
      return "Platter.math.ImmutableRect(" + str + ")";
    };

    return ImmutableRect;
  })(Rect);

  exports.MutableRect = Rect;
  exports.ImmutableRect = ImmutableRect;
  exports['default'] = Rect;
});
