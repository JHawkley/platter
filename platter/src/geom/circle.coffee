`import Factory from '../factory/base'`
`import Node from '../space/node'`
`import Primative from './primative'`
`import { methods as primativeMethods } from './primative'`

typeGroup = Node.addType 'circle'

circleFactory = new Factory class extends Primative
  Object.defineProperty @prototype, 'radius',
    get: -> @_data.radius
  
  constructor: -> super()
  toRect: -> @_data.rect
  toString: -> "Platter.geom.Circle##{@id}({x: #{@x}, y: #{@y}, radius: #{@radius}})"

methods =
  # Sets the radius of the circle.
  radius:
    apply: (r) -> @radius = r
  # Provides an appropriate rectangle bounding box.
  rectangle:
    finalize: ->
      r = @radius
      throw new Error('no radius provided') unless r?
      d = r * 2
      @rect = { x: @x - r, y: @y - r, width: d, height: d }
    seal: -> Object.freeze(@rect)
  # Provides the node type.
  type:
    finalize: -> @type = typeGroup

for k, v of primativeMethods
  circleFactory.method(k, v)
for k, v of methods
  circleFactory.method(k, v)

`export { methods }`
`export default circleFactory`