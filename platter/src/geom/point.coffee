`import Factory from '../factory/base'`
`import Primative from './primative'`
`import { methods as nodeMethods } from '../space/node'`
`import { methods as primativeMethods } from './primative'`
`import { MutableVector } from '../math/vector'`
`import { set } from '../math/vector-math'`
`import { point as support } from './_support'`
`import { point as type } from './_type'`
`import PointProxy from '../phys/proxy-point'`

pointFactory = new Factory class extends Primative
  constructor: -> super()
  support: (out, v) -> support(out, this, v)
  centerOf: (out) -> set(out, this)
  makeProxy: -> PointProxy.create(this)
  toRect: (out) -> out.set(@_data.rect); return out
  toString: -> "Platter.geom.Point##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Provides an appropriate rectangle bounding box.
  rectangle:
    finalize: -> @rect = { x: @x, y: @y, width: 0, height: 0 }
    seal: -> Object.freeze(@rect)
  # Provides the node type.
  typeGroup:
    finalize: -> @type.push type

for k, v of nodeMethods
  pointFactory.method(k, v)
for k, v of primativeMethods
  pointFactory.method(k, v)
for k, v of methods
  pointFactory.method(k, v)

`export { methods, type }`
`export default pointFactory`