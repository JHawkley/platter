define(["exports", "module"], function (exports, module) {
  "use strict";

  var tolerantCompare;

  tolerantCompare = function (f1, f2) {
    return Math.abs(f1 - f2) < 1e-14;
  };

  module.exports = tolerantCompare;
});
