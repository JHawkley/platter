`import Factory from '../factory/base'`
`import Group, {type as fGroup} from './group'`
`import { methods as groupMethods } from './group'`
`import Node from './node'`
`import Vector from '../math/vector'`

typeGroup = Node.addType 'dynamic'

dynamicFactory = new Factory class extends Group.ctor
  
  Object.defineProperty @prototype, 'delta',
    get: -> @_instanceData.delta
    set: (val) ->
      { x, y } = val
      if not(x? and y?)
        throw new Error('not a proper vector with `x` and `y` properties')
      @_instanceData.delta.setXY(x, y)
  
  constructor: (x, y, dx, dy) ->
    super(x, y)
    _instanceData = @_instanceData ?= { delta: null }
    _instanceData.delta = Vector.create(dx ? 0, dy ? 0)
  
  destroy: ->
    super()
    _instanceData = @_instanceData
    _instanceData.delta.release()
    _instanceData.delta = null
  
  checkType: (type) -> switch
    when type is 0x00000000 then true
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