`import Factory from '../factory/base'`
`import Point from '../geom/point'`
`import Vector from '../math/vector'`
`import Matrix from '../math/matrix'`
`import { type as fKinematic } from '../space/kinematic'`
`import { type as fDynamic } from '../space/dynaimc'`

movable = fKinematic | fDynamic

# Working matrix.
wm = new Matrix()

set = (pt, other) -> pt.x = other.x; pt.y = other.y
setXY = (pt, x, y) -> py.x = x; pt.y = y

between = (v, x, y) ->
  min = Math.min(x, y)
  max = Math.max(x, y)
  return min <= v <= max

proxyPointFactory = new Factory class

  Object.defineProperty @prototype, 'static',
    get: -> !(@proxied.parent.type & movable)
  
  constructor: (proxied) ->
    if proxied not instanceof Point
      throw new Error('incorrect proxy for primative')
    @proxied = proxied
    if not @initialized
      @oldDelta = Vector.create(0, 0)
      @oldPosition = { x: 0, y: 0 }
      @delta = Vector.create(0, 0)
      @points = { '0': { x: 0, y: 0 }, '1': { x: 0, y: 0 }, length: 0 }
      @_rect = {}
  
  destroy: ->
    @proxied = null
    @points.length = 0
  
  # Calculates the current world-space information to make updates
  # more rapidly calculable.  Called once at the beginning of a time step.
  sync: ->
    { proxied, oldPosition: oPos } = this
    { x, y, parent: { flipX, flipY } } = proxied
    
    setXY(oPos, (if flipX then -x else x), (if flipY then -y else y))
    wm.reset()
    proxied.iterateUpToRoot (anc) ->
      # Don't apply the world's translation.
      wm.translate(anc.x, anc.y) if parent?
    wm.applyToPoint(oPos)
  
  # Resets the old and working deltas and recalculates the swept geometry.
  # Called before the proxy is used in a collision test.
  update: (axis) ->
    { proxied, points, oldDelta: oDelta, oldPosition: oPos } = this
    { x, y, parent: { delta: d } } = proxied
    set((pt1 = points[0]), oPos)
    
    if d? then dx = d.x; dy = d.y
    else dx = 0; dy = 0
    oDelta.setXY(dx, dy)
    delta.setXY(dx, dy)
    
    @reform(dx, dy)
  
  # Recalculates the swept shape based on changes to the delta.
  # Called whenever the current delta values are suspected to have changed.
  reform: (dx, dy) ->
    points = @points
    switch axis
      when 'x'
        if dx isnt 0
          setXY(points[1], pt0.x + dx, pt0.y)
          points.length = 2
        else
          points.length = 1
      when 'y'
        if dy isnt 0
          setXY(points[1], pt0.x, pt0.y + dy)
          points.length = 2
        else
          points.length = 1
    
    # Updates rectangle bounds.
    @asRect(true)
  
  # Applies the changes to the working delta to the node's parent,
  # if applicable to do so.  Called after the proxy was used in a
  # collision resolution.
  #
  # Returns `true` if the object has been repositioned such that
  # it is no longer within the bounds of the swept geometry.
  apply: ->
    { x: ndx, y: ndy } = @delta
    unsafe = false
    if @static
      if 0 in [ndx, ndy]
        throw new Error('cannot reposition a static object')
    else
      # Alter the group's delta, flagging if the repositioning was unsafe.
      { x: odx, y: ody }
      unsafe = not (between(ndx, 0, odx) and between(ndy, 0, ody))
      @proxy.parent.delta.setXY(ndx, ndy)
    return unsafe
  
  toRect: (forcedUpdate = false) ->
    return @_rect unless forcedUpdate
    { _rect: rect, points } = this
    if points.length is 1
      set(rect, points[0])
      rect.width = 0
      rect.height = 0
    else
      [{x: x1, y: y1}, {x: x2, y: y2}] = points
      rect.x = Math.min(x1, x2)
      rect.y = Math.min(y1, y2)
      rect.width = Math.abs(x1 - x2)
      rect.height = Math.abs(y1 - y2)
    return rect
  
  toString: -> "Proxied::#{@proxied.toString()}"
  
`export default proxyPointFactory`