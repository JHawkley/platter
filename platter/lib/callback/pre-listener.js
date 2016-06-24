define(['exports', 'module', './options', './events', '../utils/array'], function (exports, module, _options, _events, _utilsArray) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CallbackOptions = _interopRequireDefault(_options);

  var _cbEvents = _interopRequireDefault(_events);

  var PreListener, registeredListeners, sortFn;

  sortFn = function (a, b) {
    return b.precedence - a.precedence;
  };

  registeredListeners = [];

  PreListener = (function () {
    PreListener.findMatches = function (a, b, event) {
      var j, len, listener, matches;
      matches = [];
      for (j = 0, len = registeredListeners.length; j < len; j++) {
        listener = registeredListeners[j];
        if (!(event & listener.events)) {
          continue;
        }
        if (listener.test(a, b)) {
          matches.push(listener);
        }
      }
      return matches.sort(sortFn);
    };

    function PreListener(eventFlags, opt1, opt2, optionsHash, fn) {
      var ref;
      if (typeof optionsHash === 'function') {
        fn = optionsHash;
        optionsHash = {};
      }
      if (typeof eventFlags !== 'number' || !(eventFlags & _cbEvents['default'].all)) {
        throw new Error('a valid event flag must be provided');
      }
      if ((0, _utilsArray.isArray)(opt1)) {
        opt1 = new _CallbackOptions['default'](opt1);
      }
      if ((0, _utilsArray.isArray)(opt2)) {
        opt2 = new _CallbackOptions['default'](opt2);
      }
      this.interactor1 = opt1;
      this.interactor2 = opt2;
      this.events = eventFlags;
      this.precedence = (ref = optionsHash.precedence) != null ? ref : 0;
      this.fn = fn;
      this.registered = false;
      return;
    }

    PreListener.prototype.register = function () {
      if (!this.registered) {
        registeredListeners.push(this);
        this.registered = true;
      }
      return this;
    };

    PreListener.prototype.unregister = function () {
      var i;
      if (this.registered) {
        i = registeredListeners.indexOf(this);
        (0, _utilsArray.removeAt)(registeredListeners, i);
        this.registered = false;
      }
      return this;
    };

    PreListener.prototype.test = function (a, b) {
      var aType, bType;
      aType = a.type;
      bType = b.type;
      if (this.interactor1.test(aType) && this.interactor2.test(bType)) {
        return true;
      }
      if (this.interactor1.test(bType) && this.interactor2.test(aType)) {
        return true;
      }
      return false;
    };

    return PreListener;
  })();

  module.exports = PreListener;
});
