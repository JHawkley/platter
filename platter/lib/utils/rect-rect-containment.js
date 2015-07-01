define(["exports", "module"], function (exports, module) {
  "use strict";

  var RectRectContainment;

  RectRectContainment = function (rect, bounds) {
    return rect.x >= bounds.x && rect.y >= bounds.y && rect.x + rect.width <= bounds.x + bounds.width && rect.y + rect.height <= bounds.y + bounds.height;
  };

  module.exports = RectRectContainment;
});
