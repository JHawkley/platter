define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var forUsing, isIterable, iteratorSymbol, ref;

  exports.iteratorSymbol = iteratorSymbol = (ref = typeof Symbol !== 'undefined' && Symbol !== null ? Symbol.iterator : void 0) != null ? ref : '@@iterator';

  exports.forUsing = forUsing = function (iterable, fn) {
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

  exports.isIterable = isIterable = function (obj) {
    return obj[iteratorSymbol] != null;
  };

  exports.iteratorSymbol = iteratorSymbol;
  exports.forUsing = forUsing;
  exports.isIterable = isIterable;
});
