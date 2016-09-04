root = global ? window

try
  es6_iterateOn = new Function('it', 'fn', 'var v; for (v of it) { fn(v); }')
catch
  es6_iterateOn = null

es5_iterateOn = (iterable, fn) ->
  iteratorSymbol = Symbol.iterator
  if iterable[iteratorSymbol]?
    iterator = iterable[iteratorSymbol]()
  else if typeof iterable.next is 'function'
    iterator = iterable
  else
    throw new Error('not a well-formed iterable')
  fn(it.value) until ((it = iterator.next()).done)
  return

root.iterateOn = es6_iterateOn ? es5_iterateOn