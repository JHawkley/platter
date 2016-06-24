define(['exports', '../factory/base', './group', './node', './_type', '../config', '../utils/es6', '../utils/rect-rect-intersection', '../math/rect', '../callback/pre-listener', '../phys/toi-island'], function (exports, _factoryBase, _group, _node, _type, _config, _utilsEs6, _utilsRectRectIntersection, _mathRect, _callbackPreListener, _physToiIsland) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Factory = _interopRequireDefault(_factoryBase);

  var _Group = _interopRequireDefault(_group);

  var _config2 = _interopRequireDefault(_config);

  var _Rect = _interopRequireDefault(_mathRect);

  var _PreListener = _interopRequireDefault(_callbackPreListener);

  var _TIsland = _interopRequireDefault(_physToiIsland);

  var aRect,
      bRect,
      buffer,
      k,
      methods,
      stepProgress,
      v,
      worldFactory,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = ({}).hasOwnProperty;

  buffer = [];

  aRect = _Rect['default'].create();

  bRect = _Rect['default'].create();

  stepProgress = {
    startTime: 0,
    endTime: 0,
    stepLength: 0,
    stepProgress: 0,
    subStepEnd: 0
  };

  worldFactory = new _Factory['default']((function (superClass) {
    extend(_Class, superClass);

    _Class.init = function (instance) {
      instance.time = 0;
      return instance.spatialMap = _config2['default'].broadphaseClass.create(this);
    };

    Object.defineProperty(_Class.prototype, 'x', {
      get: function get() {
        return this._data.x;
      }
    });

    Object.defineProperty(_Class.prototype, 'y', {
      get: function get() {
        return this._data.y;
      }
    });

    Object.defineProperty(_Class.prototype, 'width', {
      get: function get() {
        return this._data.width;
      }
    });

    Object.defineProperty(_Class.prototype, 'height', {
      get: function get() {
        return this._data.height;
      }
    });

    function _Class() {
      _Class.__super__.constructor.call(this);
      this.spatialMap = null;
    }

    _Class.prototype.destroy = function () {
      _Class.__super__.destroy.call(this);
      this.spatialMap.release();
      return this.spatialMap = null;
    };

    _Class.prototype.step = function (timeLapsed) {
      var islands;
      stepProgress.startTime = this.time;
      stepProgress.endTime = this.time + timeLapsed;
      stepProgress.stepLength = timeLapsed;
      stepProgress.stepProgress = 0;
      stepProgress.subStepEnd = 1;
      while (stepProgress.stepProgress < 1) {
        islands = this.broadphase(stepProgress);
        if (islands == null) {
          break;
        }
      }
      return this.time = stepProgress.endTime;
    };

    _Class.prototype.broadphase = function (prog) {
      var a, aIs, b, bIs, cTime, eTime, headIsland, i, j, len, len1, newIsland, ref;
      eTime = prog.subStepEnd;
      cTime = prog.stepProgress;
      headIsland = null;
      this.spatialMap.clear();
      (0, _utilsEs6.iterateOn)(this, (function (_this) {
        return function (a) {
          var delta, i, len, node, px, ref;
          px = a.proxy;
          if (px.island != null) {
            _TIsland['default'].releaseList(px.island);
          }
          delta = px.delta;
          ref = delta.nodes;
          for (i = 0, len = ref.length; i < len; i++) {
            node = ref[i];
            if (!(node.pos >= cTime)) {
              continue;
            }
            if (node.pos < eTime) {
              eTime = node.pos;
            }
            break;
          }
          if (px.isKinematic) {
            buffer.push(px);
          } else {
            _this.spatialMap.insert(px);
          }
        };
      })(this));
      for (i = 0, len = buffer.length; i < len; i++) {
        a = buffer[i];
        ref = this.spatialMap.retrieve(a);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          b = ref[j];
          if (a.parent === b.parent) {
            continue;
          }
          if (a.island === b.island) {
            continue;
          }
          if (!(0, _utilsRectRectIntersection.rectRectIntersection)(a.toRect(aRect), b.toRect(bRect))) {
            continue;
          }
          aIs = a.island != null;
          bIs = b.island != null;
          switch (false) {
            case !!(aIs || bIs):
              newIsland = _TIsland['default'].create(a, b);
              if (headIsland != null) {
                headIsland.prev = newIsland;
                newIsland.next = headIsland;
              }
              headIsland = newIsland;
              break;
            case !(aIs && !bIs):
              a.island.add(b);
              break;
            case !(bIs && !aIs):
              b.island.add(a);
              break;
            default:
              a.island.absorb(b.island);
          }
        }
      }
      buffer.length = 0;
      prog.subStepEnd = eTime;
      return headIsland;
    };

    _Class.prototype.narrowphase = function (islandList, events) {
      return (0, _utilsEs6.iterateOn)(islandList, function (island) {});
    };

    _Class.prototype.wasAdoptedBy = function () {
      throw new Error('worlds must remain a root node');
    };

    _Class.prototype.toRect = function (out) {
      out.set(this);
      return out;
    };

    _Class.prototype.contentAsRect = function (out) {
      _Group['default'].ctor.prototype.toRect.call(this, out);
      return out;
    };

    _Class.prototype.toString = function () {
      var bounds;
      bounds = "{x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + "}";
      return "Platter.space.World#" + this.id + "(" + bounds + ")";
    };

    return _Class;
  })(_Group['default'].ctor));

  exports.methods = methods = {
    filter: {
      init: function init() {
        return this.filter = {
          included: [_type.group],
          excluded: []
        };
      },
      seal: function seal() {
        return _group.methods.filter.seal.call(this);
      }
    },
    position: {
      init: function init() {
        this.x = 0;
        return this.y = 0;
      },
      apply: function apply(x, y) {
        this.x = x;
        this.y = y;
      }
    },
    dimensions: {
      apply: function apply(width, height) {
        this.width = width;
        this.height = height;
      },
      finalize: function finalize() {
        if (!(this.width != null && this.height != null) || this.width <= 0 || this.height <= 0) {
          throw new Error('both dimensions must be provided');
        }
      }
    },
    width: {
      apply: function apply(width) {
        this.width = width;
      }
    },
    height: {
      apply: function apply(height) {
        this.height = height;
      }
    },
    typeGroup: {
      finalize: function finalize() {
        _group.methods.typeGroup.finalize.call(this);
        return this.type.push(_type.world);
      }
    }
  };

  for (k in _node.methods) {
    v = _node.methods[k];
    worldFactory.method(k, v);
  }

  for (k in _group.methods) {
    v = _group.methods[k];
    if (k !== 'filter' && k !== 'include' && k !== 'exclude' && k !== 'typeGroup') {
      worldFactory.method(k, v);
    }
  }

  for (k in methods) {
    v = methods[k];
    worldFactory.method(k, v);
  }

  exports.methods = methods;
  exports['default'] = worldFactory;
});
