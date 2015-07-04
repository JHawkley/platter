`import Factory from '../factory/base'`
`import Group, { type as fGroup } from './group'`
`import { methods as groupMethods } from './group'`
`import Node from './node'`
`import Vector from '../math/vector'`
`import { type as fPoint } from '../geom/point'`
`import { type as fCircle } from '../geom/circle'`
`import { type as fAABB } from '../geom/aabb'`

typeGroup = Node.addType 'kinematic'
allowedNodeTypes = (fPoint | fCircle | fAABB)

kinematicFactory = new Factory class extends Group.ctor
  
  # The primary colliding body.  When `floating` is `false`, this
  # primative will collide with lines (it would consider to be ground)
  # and circles along its center-line (more-or-less; it's complicated).
  Object.defineProperty @prototype, 'body',
    get: -> @_instanceData.body
    set: (val) -> @setBody(val)
  
  Object.defineProperty @prototype, 'delta',
    get: -> @_instanceData.delta
    set: (val) ->
      { x, y } = val
      if not(x? and y?)
        throw new Error('not a proper vector with `x` and `y` properties')
      @_instanceData.delta.setXY(x, y)
  
  # Alias to `flipX`
  Object.defineProperty @prototype, 'mirror',
    get: -> @flipX
    set: (val) -> @flipX = val
  
  # Alias to `flipY`
  Object.defineProperty @prototype, 'invert',
    get: -> @flipY
    set: (val) -> @flipY = val
  
  constructor: (x, y) ->
    super(x, y)
    _instanceData = @_instanceData ?= { body: null, delta: null }
    _instanceData.body = null
    _instanceData.delta = Vector.create(0, 0)
    # These will be reflected by the primative proxies.
    @flipX = false
    @flipY = false
    # Affect collision detection behavior.
    @floating = true
    @minClimableGrade = -45 * (Math.PI / 180)
    @maxClimableGrade = 45 * (Math.PI / 180)
  
  destroy: ->
    super()
    _instanceData = @_instanceData
    _instanceData.delta.release()
    _instanceData.body = null
    _instanceData.delta = null
  
  # Sets the `body` property.  This function is handy as it can be
  # chained: `Kinematic.create().adopt(body).setBody(body)`
  setBody: (body) ->
    if body?
      if body.parent isnt this
        throw new Error('a body must be a child of the kinematic')
      if !(body.type & fAABB)
        throw new Error('only AABBs may be a body')
    @_instanceData.body = body
    return this
  
  # Unsets the body if it is orphaned.
  orphanObj: (obj) ->
    super(obj)
    @_instanceData.body = null if obj is @_instanceData.body
    return this
  
  toString: -> "Platter.space.Kinematic##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter to specifically allow points, circles, and AABBs
  # and exclude groups.
  filter:
    init: -> @filter = { allowed: allowedNodeTypes, excluded: fGroup }
    seal: -> Object.freeze(@filter)
  # Provides the node type.
  type:
    finalize: ->
      groupMethods.type.finalize.call(this)
      @type |= typeGroup

for k, v of groupMethods when k not in ['filter', 'allow', 'type']
  kinematicFactory.method(k, v)
for k, v of methods
  kinematicFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default kinematicFactory`