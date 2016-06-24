define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var insertAt, isArray, removeAt;

  exports.removeAt = removeAt = function (arr, idx) {
    var i, j, ref, ref1;
    if (!(0 <= idx && idx < arr.length)) {
      throw new Error('index out of range');
    }
    for (i = j = ref = idx, ref1 = arr.length - 1; j < ref1; i = j += 1) {
      arr[i] = arr[i + 1];
    }
    arr.length = arr.length - 1;
  };

  exports.insertAt = insertAt = function (arr, obj, idx) {
    var i, j, ref, ref1;
    if (!(0 <= idx && idx <= arr.length)) {
      throw new Error('index out of range');
    }
    arr.length += 1;
    for (i = j = ref = arr.length - 1, ref1 = idx; j > ref1; i = j += -1) {
      arr[i] = arr[i - 1];
    }
    arr[idx] = obj;
  };

  exports.isArray = isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  exports.removeAt = removeAt;
  exports.insertAt = insertAt;
  exports.isArray = isArray;
});
