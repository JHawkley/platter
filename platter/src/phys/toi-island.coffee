`import { iteratorSymbol } from '../utils/es6'`

class TOIIsland

  id = 0
  pool = []

  @create: (a, b) ->
    instance = pool.pop() ? new TOIIsland()
    return TOIIsland.init(instance, a, b)
  
  @releaseList: (island) ->
    { prev, next } = island
    while prev?
      p = prev.prev
      prev.release()
      prev = p
    while next?
      n = next.next
      next.release()
      next = n
    @release()
  
  @reclaim: (instance) -> pool.push instance
  
  @init: (instance, a, b) ->
    instance.add(a) if a?
    instance.add(b) if b?
    return instance
  
  # ES6-compatible iterator.  Is used by `Platter.utils.es6.iterateOn()`
  # to iterate over all the islands.
  this.prototype[iteratorSymbol] = ->
    result = { value: null, done: false }
    return {
      next: =>
        if result.value?
          next = result.value.next
          if next?
            result.value = next
            result.done = false
          else
            result.value = null
            result.done = true
        else if not result.done
          result.value = this
        return result
    }
  
  constructor: ->
    @members = []
    @id = id++
    @next = null
    @prev = null
  
  add: (candidate, force = false) ->
    if candidate.island?
      return if candidate.island is this
      if force isnt true
        throw new Error('candidate is already a member of another island')
    candidate.island = this
    @members.push candidate
    return this
  
  absorb: (other) ->
    @add(candidate, true) for candidate in other.members
    other.members.length = 0
    other.cutOut()
    return this
  
  cutOut: ->
    { next, prev } = this
    prev?.next = next
    next?.prev = prev
    @next = null
    @prev = null
  
  release: ->
    member.island = null for member in @members
    @members.length = 0
    TOIIsland.reclaim(this)

`export default TOIIsland`