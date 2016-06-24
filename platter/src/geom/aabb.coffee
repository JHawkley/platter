`import Factory from '../factory/base'`
`import Primative from './primative'`
`import { methods as nodeMethods } from '../space/node'`
`import { methods as primativeMethods } from './primative'`
`import { MutableVector } from '../math/vector'`
`import { setXY } from '../math/vector-math'`
`import { aabb as support } from './_support'`
`import { aabb as type } from './_type'`

aabbFactory = new Factory class extends Primative
  
  Object.defineProperty @prototype, 'width',
    get: -> @_data.width
  
  Object.defineProperty @prototype, 'height',
    get: -> @_data.height
  
  constructor: -> super()
  support: (out, v) -> support(out, this, v)
  centerOf: (out) -> setXY(out, @x + @width / 2, @y + @height / 2)
  toRect: (out) -> out.set(this); return out
  toString: ->
    objRep = "{x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}}"
    return "Platter.geom.AABB##{@id}(#{objRep})"

methods =
  # Sets the dimensions, width and height, of the box.
  dimensions:
    apply: (@width, @height) -> return
    finalize: ->
      if not (@width? and @height?) or @width <= 0 or @height <= 0
        throw new Error('both dimensions must be provided')
  # Sets the width of the box.
  width:
    apply: (@width) -> return
  # Sets the height of the box.
  height:
    apply: (@height) -> return
  # Provides the node type.
  typeGroup:
    finalize: -> @type.push type

for k, v of nodeMethods
  aabbFactory.method(k, v)
for k, v of primativeMethods
  aabbFactory.method(k, v)
for k, v of methods
  aabbFactory.method(k, v)

`export { methods }`
`export default aabbFactory`