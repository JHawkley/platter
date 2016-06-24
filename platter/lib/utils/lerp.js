define(["exports", "module"], function (exports, module) {
  "use strict";

  var lerp;

  lerp = function (x, y, v) {
    return x + (y - x) * v;
  };

  module.exports = lerp;
});
