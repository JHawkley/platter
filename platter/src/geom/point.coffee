`import Factory from '../factory/base'`
`import Node from '../space/node'`
`import Primative from './primative'`
`import { methods as primativeMethods } from './primative'`

typeGroup = Node.addType 'point'

pointFactory = new Factory class extends Primative
  constructor: -> super()
  toRect: -> @_data.rect
  toString: -> "Platter.geom.Point##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Provides an appropriate rectangle bounding box.
  rectangle:
    finalize: -> @rect = { x: @x, y: @y, width: 0, height: 0 }
    seal: -> Object.freeze(@rect)
  # Provides the node type.
  type:
    finalize: -> @type = typeGroup

for k, v of primativeMethods
  pointFactory.method(k, v)
for k, v of methods
  pointFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default pointFactory`