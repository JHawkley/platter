define(["exports", "module"], function (exports, module) {
  "use strict";

  var debug;

  debug = {
    log: function log() {
      return console.log.apply(console, arguments);
    },
    warn: function warn() {
      var ref;
      return ((ref = console.warn) != null ? ref : console.log).apply(null, arguments);
    },
    error: function error() {
      var ref;
      return ((ref = console.error) != null ? ref : console.log).apply(null, arguments);
    },
    assert: function assert(msg, test) {
      if (!test) {
        throw new Error(msg);
      }
    }
  };

  module.exports = debug;
});
