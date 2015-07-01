define(["exports", "module"], function (exports, module) {
  "use strict";

  var findBounds;

  findBounds = function (arr, ref) {
    var bottom, height, i, left, len, rect, right, top, width, x, y;
    if (ref == null) {
      ref = {};
    }
    if (arr.length === 0) {
      ref.x = 0;
      ref.y = 0;
      ref.width = 0;
      ref.height = 0;
      return ref;
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
      ref.x = left;
      ref.y = top;
      ref.width = right - left;
      ref.height = bottom - top;
      return ref;
    }
  };

  module.exports = findBounds;
});
