`import Vector, { ImmutableVector } from './vector'`
`import { set, setXY } from './vector-math'`

zeroVector = ImmutableVector.create(0, 0)
workingVector = Vector.create(0, 0)

map = (out, nStart, nStop, vMin, vMax, n) ->
  s = ((n - nStart) / (nStop - nStart))
  x = vMin.x + (vMax.x - vMin.x) * s
  y = vMin.y + (vMax.y - vMin.y) * s
  setXY(out, x, y)
  return out

class InterpolationNode

  pool = []
  
  @init: (instance, pos, value) ->
    throw new Error('out of range') unless 0 <= pos <= 1
    throw new Error('null reference') unless value?
    instance.pos = pos
    instance.value = value.copy()
  @create: (pos, value) ->
    instance = pool.pop() ? new InterpolationNode()
    InterpolationNode.init(instance, pos, value)
    return instance
  @reclaim: (obj) ->
    obj.value.release()
    obj.value = null
    pool.push(obj)
  release: -> InterpolationNode.reclaim(this)

  @comparer: (a, b) -> a.pos - b.pos

  constructor: ->
    @pos = 0.0
    @value = zeroVector

class VectorInterpolation

  constructor: ->
    @nodes = []
  
  valueAt: (out, pos) ->
    nodes = @nodes
    if nodes.length is 0
      set(out, zeroVector)
    else if pos <= 0.0
      node = nodes[0]
      set(out, if node.pos is 0.0 then node.value else zeroVector)
    else
      node = nodes[nodes.length - 1]
      if pos >= 1.0 or pos >= node.pos
        set(out, node.value)
      else
        lPos = 0.0
        lValue = zeroVector
        
        for node in nodes
          { pos: cPos, value: cValue } = node
          # Prevent division by 0.
          if cPos is lPos
            if pos is cPos
              set(out, cValue)
              break
          else if lPos < pos <= cPos
            map(out, lPos, cPos, lValue, cValue, pos)
            break
          lPos = cPos
          lValue = cValue
    return out
  
  add: (value, pos = 1.0) ->
    nodes = @nodes
    nodes.push InterpolationNode.create(pos, value)
    nodes.sort InterpolationNode.comparer
    return this
  
  set: (value) ->
    @clear() if @nodes.length > 0
    @add(value, 1.0)
  
  # Sets 1.0 to `value` while maintaining the value at `pos` such that
  # `valueAt(pos)` will return the same value after this function is called.
  # Values at other positions may have changed, though.
  divert: (pos, value) ->
    if pos >= 1.0
      @set(value)
    else
      @valueAt(workingVector, pos)
      @set(value)
      @add(workingVector, pos)
  
  clear: ->
    nodes = @nodes
    node.release() for node in nodes
    nodes.length = 0
    return this

`export default VectorInterpolation`