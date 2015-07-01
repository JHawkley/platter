define(["exports", "module"], function (exports, module) {
  "use strict";

  var RectRectIntersection;

  RectRectIntersection = function (a, b) {
    var num1, num2, x, y;
    x = Math.max(a.x, b.x);
    num1 = Math.min(a.x + a.width, b.x + b.width);
    y = Math.max(a.y, b.y);
    num2 = Math.min(a.y + a.height, b.y + b.height);
    return num1 >= x && num2 >= y;
  };

  module.exports = RectRectIntersection;
});
