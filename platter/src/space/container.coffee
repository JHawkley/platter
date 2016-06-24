`import Factory from '../factory/base'`
`import Group from './group'`
`import { methods as nodeMethods } from './node'`
`import { methods as groupMethods } from './group'`
`import { group as tGroup } from './_type'`
`import { container as typeGroup } from './_type'`

containerFactory = new Factory class extends Group.ctor
  
  @init: (instance, x, y) -> super(instance, x, y)
  
  constructor: -> super()
  
  toString: -> "Platter.space.Container##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter to specifically allow only groups.
  filter:
    init: -> @filter = { included: [tGroup], excluded: [] }
    seal: -> groupMethods.filter.seal.call(this)
  # Provides the node type.
  typeGroup:
    finalize: ->
      groupMethods.typeGroup.finalize.call(this)
      @type.push typeGroup

for k, v of nodeMethods
  containerFactory.method(k, v)
for k, v of groupMethods when k not in ['filter', 'include', 'typeGroup']
  containerFactory.method(k, v)
for k, v of methods
  containerFactory.method(k, v)

`export { methods }`
`export default containerFactory`