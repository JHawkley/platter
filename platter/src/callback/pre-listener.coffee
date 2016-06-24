`import CallbackOptions from './options'`
`import cbEvents from './events'`
`import { isArray, removeAt } from '../utils/array'`

# Sorts such that those with higher precedence come before those
# with lower precedence.
sortFn = (a, b) -> b.precedence - a.precedence

# TODO: Increase efficency of storing/finding these functions.
# Suggest using a hashmap and use (int1.included | int2.included)
# as the lookup hash.  We can do a for-of loop to go over the keys
# and perform (key & (a.value | b.value)) when seeking matches.
registeredListeners = []

# Called to check if a collision between two objects should be checked.
class PreListener

  @findMatches: (a, b, event) ->
    matches = []
    for listener in registeredListeners
      continue unless event & listener.events
      matches.push(listener) if listener.test(a, b)
    return matches.sort(sortFn)

  # Overloaded:
  #   Arity 4: (eventFlags, opt1, opt2, fn)
  #   Arity 5: (eventFlags, opt1, opt2, optionsHash, fn)
  constructor: (eventFlags, opt1, opt2, optionsHash, fn) ->
    if typeof optionsHash is 'function'
      fn = optionsHash
      optionsHash = {}
    if typeof eventFlags isnt 'number' or !(eventFlags & cbEvents.all)
      throw new Error('a valid event flag must be provided')
    opt1 = new CallbackOptions(opt1) if isArray(opt1)
    opt2 = new CallbackOptions(opt2) if isArray(opt2)
    
    @interactor1 = opt1
    @interactor2 = opt2
    @events = eventFlags
    @precedence = optionsHash.precedence ? 0
    @fn = fn
    
    @registered = false
    return
    
  register: ->
    if not @registered
      registeredListeners.push(this)
      @registered = true
    return this
    
  unregister: ->
    if @registered
      i = registeredListeners.indexOf(this)
      removeAt(registeredListeners, i)
      @registered = false
    return this
  
  test: (a, b) ->
    aType = a.type; bType = b.type
    return true if @interactor1.test(aType) and @interactor2.test(bType)
    return true if @interactor1.test(bType) and @interactor2.test(aType)
    return false

`export default PreListener`