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
  
  constructor: (x, y, dx, dy) ->
    super(x, y)
    @delta = Vector.create(dx ? 0, dy ? 0)
  
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