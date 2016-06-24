`import Factory from '../factory/base'`
`import Group from './group'`
`import { methods as nodeMethods } from './node'`
`import { methods as groupMethods } from './group'`
`import { kinematic as typeGroup } from './_type'`
`import VectorInterpolation from '../math/vector-interpolation'`
`import { group as tGroup } from './_type'`
`import { point as tPoint } from '../geom/_type'`
`import { circle as tCircle } from '../geom/_type'`
`import { aabb as tAABB } from '../geom/_type'`

allowedTypes = [tPoint, tCircle, tAABB]

kinematicFactory = new Factory class extends Group.ctor
  
  @init: (instance, x, y) ->
    super(instance, x, y)
    # These will be reflected by the primative proxies.
    instance.flipX = false
    instance.flipY = false
    # Affect collision detection behavior.
    instance.floating = true
    instance.minClimableGrade = -45 * (Math.PI / 180)
    instance.maxClimableGrade = 45 * (Math.PI / 180)
  
  # The primary colliding body.  When `floating` is `false`, this
  # primative will collide with lines (it would consider to be ground)
  # and circles along its center-line (more-or-less; it's complicated).
  Object.defineProperty @prototype, 'body',
    get: -> @_instanceData.undynesBody
    set: (val) -> @setBody(val)
  
  Object.defineProperty @prototype, 'delta',
    get: -> @_instanceData.delta
  
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
    @_instanceData = { undynesBody: null, delta: new VectorInterpolation() }
  
  destroy: ->
    super()
    _instanceData = @_instanceData
    _instanceData.delta.clear()
    _instanceData.undynesBody = null
  
  # Sets the `body` property.  This function is handy as it can be
  # chained: `Kinematic.create().adopt(body).setBody(body)`
  setBody: (body) ->
    if body?
      if body.parent isnt this
        throw new Error('a body must be a child of the kinematic')
      if not tAABB.test(body.type)
        throw new Error('only AABBs may be a body')
    @_instanceData.undynesBody = body
    return this
  
  # Unsets the body if it is orphaned.
  orphan: (obj) ->
    super(obj)
    @_instanceData.undynesBody = null if obj is @_instanceData.undynesBody
    return this
  
  toString: -> "Platter.space.Kinematic##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter to specifically allow points, circles, and AABBs
  # and exclude groups.
  filter:
    init: -> @filter = { included: allowedTypes[..], excluded: [tGroup] }
    seal: -> groupMethods.filter.seal.call(this)
  # Provides the node type.
  typeGroup:
    finalize: ->
      groupMethods.typeGroup.finalize.call(this)
      @type.push typeGroup

for k, v of nodeMethods
  kinematicFactory.method(k, v)
for k, v of groupMethods when k not in ['filter', 'include', 'typeGroup']
  kinematicFactory.method(k, v)
for k, v of methods
  kinematicFactory.method(k, v)

`export { methods }`
`export default kinematicFactory`