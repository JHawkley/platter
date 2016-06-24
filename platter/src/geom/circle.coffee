`import Factory from '../factory/base'`
`import Primative from './primative'`
`import { methods as nodeMethods } from '../space/node'`
`import { methods as primativeMethods } from './primative'`
`import { MutableVector } from '../math/vector'`
`import { set } from '../math/vector-math'`
`import { circle as support } from './_support'`
`import { circle as type } from './_type'`
`import CircleProxy from '../phys/proxy-circle'`

circleFactory = new Factory class extends Primative
  Object.defineProperty @prototype, 'radius',
    get: -> @_data.radius
  
  constructor: -> super()
  support: (out, v) -> support(out, this, v)
  centerOf: (out) -> set(out, this)
  makeProxy: -> CircleProxy.create(this)
  toRect: (out) -> out.set(@_data.rect); return out
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
  typeGroup:
    finalize: -> @type.push type

for k, v of nodeMethods
  circleFactory.method(k, v)
for k, v of primativeMethods
  circleFactory.method(k, v)
for k, v of methods
  circleFactory.method(k, v)

`export { methods }`
`export default circleFactory`