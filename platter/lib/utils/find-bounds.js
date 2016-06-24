define(["exports", "module"], function (exports, module) {
  "use strict";

  var findBounds;

  findBounds = function (out, arr) {
    var bottom, height, i, left, len, rect, right, top, width, x, y;
    if (arr.length === 0) {
      out.x = 0;
      out.y = 0;
      out.width = 0;
      out.height = 0;
      return out;
    } else {
      top = left = Number.POSITIVE_INFINITY;
      bottom = right = Number.NEGATIVE_INFINITY;
      for (i = 0, len = arr.length; i < len; i++) {
        rect = arr[i];
        x = rect.x, y = rect.y, width = rect.width, height = rect.height;
        top = Math.min(top, y);
        left = Math.min(left, x);
        bottom = Math.max(bottom, y + height);
        right = Math.max(right, x + width);
      }
      out.x = left;
      out.y = top;
      out.width = right - left;
      out.height = bottom - top;
      return out;
    }
  };

  module.exports = findBounds;
});
