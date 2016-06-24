define(["exports", "module"], function (exports, module) {
  "use strict";

  var distance;

  distance = function (p1, p2) {
    var x, y;
    x = p2.x - p1.x;
    y = p2.y - p1.y;
    return Math.sqrt(x * x + y * y);
  };

  module.exports = distance;
});
