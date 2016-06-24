`import Vector from '../math/vector'`
`import { removeAt, insertAt } from '../utils/array'`
    
class Simplex
  # Preperation for object-pooling.
  @init: (instance, a) ->
    instance.points.push(a) if a?
  @create: (a) -> new Simplex(a)
  @reclaim: (obj) ->
    p.release() for p in obj.points
    obj.points.length = 0
  release: -> Simplex.reclaim(this)
  
  Object.defineProperty @prototype, 'count',
    get: -> @points.length
  
  Object.defineProperty @prototype, 'a',
    get: -> @points[0]
    set: (val) ->
      pt = @points[0]
      if val isnt pt
        pt.release()
        @points[0] = val
  
  Object.defineProperty @prototype, 'b',
    get: -> @points[1]
    set: (val) ->
      pt = @points[1]
      if val isnt pt
        pt.release()
        @points[1] = val
  
  Object.defineProperty @prototype, 'c',
    get: -> @points[2]
    set: (val) ->
      pt = @points[2]
      if val isnt pt
        pt.release()
        @points[2] = val
  
  constructor: (a) ->
    @points = []
    Simplex.init(this, a)
    
  copy: ->
    retVal = Simplex.create()
    points = retVal.points
    points.push(p.copy()) for p in @points
    return retVal
  
  add: (p) -> @points.unshift(p); return this
  
  insert: (obj, idx) -> insertAt(@points, obj, idx)
  
  removeA: ->
    @points.shift().release()
    return this
  
  removeB: ->
    @points[1].release()
    removeAt(@points, 1)
    return this
  
  removeC: ->
    @points[2].release()
    removeAt(@points, 2)
    return this

`export default Simplex`