`import Factory from '../factory/base'`
`import Group from './group'`
`import { methods as groupMethods } from './group'`
`import Node from './node'`

typeGroup = Node.addType 'container'

containerFactory = new Factory class extends Group.ctor
  
  constructor: (x, y) -> super(x, y)
  
  toString: -> "Platter.space.Container##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter to specifically allow only groups.
  filter:
    init: -> @filter = { allowed: Node.types['group'], excluded: 0x00000000 }
    seal: -> Object.freeze(@filter)
  # Provides the node type.
  type:
    finalize: ->
      groupMethods.type.finalize.call(this)
      @type |= typeGroup

for k, v of groupMethods when k not in ['filter', 'allow', 'type']
  containerFactory.method(k, v)
for k, v of methods
  containerFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default containerFactory`