define(['exports', 'module'], function (exports, module) {
  'use strict';

  var Factory,
      slice = [].slice;

  Factory = (function () {
    var nextId;

    nextId = 0;

    function Factory(ctor) {
      var _shortHandGenerator, appliers, finalizers, initializers, methods, pool, sealers;
      methods = {};
      initializers = {};
      appliers = {};
      sealers = {};
      finalizers = {};
      pool = [];
      _shortHandGenerator = null;
      Object.defineProperty(this, 'ctor', {
        get: function get() {
          return ctor;
        }
      });
      this.define = function () {
        var _definition, _sealers, _stage, generator, init, k;
        _definition = {};
        _sealers = {};
        _stage = 0;
        generator = Object.create(appliers, {
          definition: {
            value: _definition
          },
          sealers: {
            value: _sealers
          },
          isSealed: {
            get: function get() {
              return _stage !== 0;
            }
          },
          seal: {
            value: function value() {
              var finalizer, k, ref;
              if (_stage !== 0) {
                throw new Error('stage invalid for sealing');
              }
              for (k in finalizers) {
                finalizer = finalizers[k];
                finalizer.call(this);
              }
              for (k in _sealers) {
                if ((ref = sealers[k]) != null) {
                  ref.call(_definition);
                }
              }
              Object.freeze(_definition);
              _stage = 1;
              return this;
            }
          },
          create: {
            value: function value() {
              var obj;
              switch (_stage) {
                case 0:
                  this.seal();
                  _stage = -1;
                  break;
                case 1:
                  _stage = 2;
                  break;
                case -1:
                  throw new Error('cannot create more than one when unsealed');
              }
              obj = null;
              if ((obj = pool.pop()) != null) {
                obj._data = _definition;
              } else {
                obj = Object.create(ctor.prototype, {
                  release: {
                    value: function value() {
                      if (typeof this.destroy === "function") {
                        this.destroy();
                      }
                      this._data = null;
                      return pool.push(this);
                    }
                  },
                  id: {
                    value: nextId++
                  }
                });
                ctor.apply(obj);
                obj._data = _definition;
              }
              if (typeof ctor.init === "function") {
                ctor.init.apply(ctor, [obj].concat(slice.call(arguments)));
              }
              return obj;
            }
          }
        });
        for (k in initializers) {
          init = initializers[k];
          init.call(generator);
        }
        return generator;
      };
      this.create = function () {
        if (_shortHandGenerator == null) {
          _shortHandGenerator = this.define().seal();
        }
        return _shortHandGenerator.create.apply(_shortHandGenerator, arguments);
      };
      this.reopen = function (fn) {
        var ref;
        ctor = (ref = fn(ctor)) != null ? ref : ctor;
        return this;
      };
      this.method = function (name, hash) {
        if (hash.init != null) {
          initializers[name] = function () {
            hash.init.call(this.definition);
            return this.sealers[name] = true;
          };
        } else {
          delete initializers[name];
        }
        if (hash.apply != null) {
          appliers[name] = function () {
            if (this.isSealed) {
              throw new Error('cannot apply method; generator is sealed');
            }
            hash.apply.apply(this.definition, arguments);
            this.sealers[name] = true;
            return this;
          };
        } else {
          delete appliers[name];
        }
        if (hash.finalize != null) {
          finalizers[name] = function () {
            hash.finalize.call(this.definition);
            return this.sealers[name] = true;
          };
        } else {
          delete finalizers[name];
        }
        if (hash.seal != null) {
          sealers[name] = hash.seal;
        } else {
          delete sealers[name];
        }
        methods[name] = hash;
        return this;
      };
      this.hasMethod = function (name, hash) {
        if (hash != null) {
          return methods[name] === hash;
        }
        return methods[name] != null;
      };
    }

    return Factory;
  })();

  module.exports = Factory;
});
