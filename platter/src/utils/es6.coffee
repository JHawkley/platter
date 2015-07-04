try
  es6_iterateOn = new Function('it', 'fn', 'var v; for (v of it) { fn(v); }')
catch
  es6_iterateOn = null

iteratorSymbol = Symbol?.iterator ? '@@iterator'

# Iterates over an iterable.
es5_iterateOn = (iterable, fn) ->
  if iterable[iteratorSymbol]?
    iterator = iterable[iteratorSymbol]()
  else if typeof iterable.next is 'function'
    iterator = iterable
  else
    throw new Error('not a well-formed iterable')
  fn(it.value) until ((it = iterator.next()).done)
  return

# NOTE: May want to disable the ES6 version, since it may not be
# optimized on all platforms.
iterateOn = es6_iterateOn ? es5_iterateOn

isIterable = (obj) -> obj[iteratorSymbol]?

# Main exports.
`export { iteratorSymbol, iterateOn, isIterable }`
# For testing.
`export { es6_iterateOn, es5_iterateOn }`