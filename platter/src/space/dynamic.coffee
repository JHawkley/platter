`import Factory from '../factory/base'`
`import Group from './group'`
`import { methods as nodeMethods } from './node'`
`import { methods as groupMethods } from './group'`
`import { group as tGroup } from './_type'`
`import { dynamic as typeGroup } from './_type'`
`import VectorInterpolation from '../math/vector-interpolation'`

dynamicFactory = new Factory class extends Group.ctor
  
  @init: (instance, x, y) -> super(instance, x, y)
  
  Object.defineProperty @prototype, 'delta',
    get: -> @_instanceData.delta
  
  constructor: ->
    super()
    @_instanceData = { delta: new VectorInterpolation() }
    Object.freeze(@_instanceData)
  
  destroy: ->
    super()
    @_instanceData.delta.clear()
  
  checkType: (type) -> switch
    when type.value is 0x00000000 then true
    when @filter.test(type) then true
    else false
  
  # Adopts a single node as a child.
  adopt: (obj) ->
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
    init: -> @filter = { included: [], excluded: [tGroup] }
    seal: -> groupMethods.filter.seal.call(this)
  # Provides the node type.
  typeGroup:
    finalize: ->
      groupMethods.typeGroup.finalize.call(this)
      @type.push typeGroup

for k, v of nodeMethods
  dynamicFactory.method(k, v)
for k, v of groupMethods when k not in ['filter', 'typeGroup']
  dynamicFactory.method(k, v)
for k, v of methods
  dynamicFactory.method(k, v)

`export { methods }`
`export default dynamicFactory`