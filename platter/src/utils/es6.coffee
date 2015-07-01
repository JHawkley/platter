iteratorSymbol = Symbol?.iterator ? '@@iterator'

# Iterates over an iterable.  If the iterable has a `forEach`
# function, as Arrays do, it will be used instead.
forUsing = (iterable, fn) ->
  if iterable[iteratorSymbol]?
    iterator = iterable[iteratorSymbol]()
  else if typeof iterable.next is 'function'
    iterator = iterable
  else
    throw new Error('not a well-formed iterable')
  fn(it.value) until ((it = iterator.next()).done)
  return

isIterable = (obj) -> obj[iteratorSymbol]?

`export { iteratorSymbol, forUsing, isIterable }`