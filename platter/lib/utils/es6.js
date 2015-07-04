define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var es5_iterateOn, es6_iterateOn, isIterable, iterateOn, iteratorSymbol, ref;

  try {
    exports.es6_iterateOn = es6_iterateOn = new Function('it', 'fn', 'var v; for (v of it) { fn(v); }');
  } catch (_error) {
    exports.es6_iterateOn = es6_iterateOn = null;
  }

  exports.iteratorSymbol = iteratorSymbol = (ref = typeof Symbol !== 'undefined' && Symbol !== null ? Symbol.iterator : void 0) != null ? ref : '@@iterator';

  exports.es5_iterateOn = es5_iterateOn = function (iterable, fn) {
    var it, iterator;
    if (iterable[iteratorSymbol] != null) {
      iterator = iterable[iteratorSymbol]();
    } else if (typeof iterable.next === 'function') {
      iterator = iterable;
    } else {
      throw new Error('not a well-formed iterable');
    }
    while (!(it = iterator.next()).done) {
      fn(it.value);
    }
  };

  exports.iterateOn = iterateOn = es6_iterateOn != null ? es6_iterateOn : es5_iterateOn;

  exports.isIterable = isIterable = function (obj) {
    return obj[iteratorSymbol] != null;
  };

  exports.iteratorSymbol = iteratorSymbol;
  exports.iterateOn = iterateOn;
  exports.isIterable = isIterable;
  exports.es6_iterateOn = es6_iterateOn;
  exports.es5_iterateOn = es5_iterateOn;
});
