`import Factory from '../factory/base'`
`import Group, {type as fGroup} from './group'`
`import { methods as groupMethods } from './group'`
`import {type as fKinematic} from './kinematic'`
`import Node from './node'`
`import Vector from '../math/vector'`

typeGroup = Node.addType 'dynamic'
fKin = fKinematic | fGroup

dynamicFactory = new Factory class extends Group.ctor
  
  constructor: (x, y, dx, dy) ->
    super(x, y)
    @delta = Vector.create(dx ? 0, dy ? 0)
  
  checkType: (type) -> switch
    when type is 0x00000000 then true
    when (type & fKin) is fKin then true
    when (!!(@filter.allowed & type) and !(@filter.excluded & type)) then true
    else false
  
  # Adopts a single node as a child.
  adoptObj: (obj) ->
    if obj is this
      throw new Error('a group may not adopt itself')
    if @checkType(obj.type)
      @children.push obj
      obj.wasAdoptedBy?(this)
    else
      throw new Error('object is not a permitted type for this group')
    return this
  
  toString: -> "Platter.space.Dynamic##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter to specifically exclude groups.
  filter:
    init: -> @filter = { allowed: 0x00000000, excluded: Node.types['group'] }
    seal: -> Object.freeze(@filter)
  # Provides the node type.
  type:
    finalize: ->
      groupMethods.type.finalize.call(this)
      @type |= typeGroup

for k, v of groupMethods when k not in ['filter', 'type']
  dynamicFactory.method(k, v)
for k, v of methods
  dynamicFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default dynamicFactory`