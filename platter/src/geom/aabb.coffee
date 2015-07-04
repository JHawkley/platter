`import Factory from '../factory/base'`
`import Node from '../space/node'`
`import Primative from './primative'`
`import { methods as primativeMethods } from './primative'`

typeGroup = Node.addType 'aabb'

aabbFactory = new Factory class extends Primative
  
  Object.defineProperty @prototype, 'width',
    get: -> @_data.width
  
  Object.defineProperty @prototype, 'height',
    get: -> @_data.height
  
  constructor: -> super()
  toRect: -> this
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
  type:
    finalize: -> @type = typeGroup

for k, v of primativeMethods
  aabbFactory.method(k, v)
for k, v of methods
  aabbFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default aabbFactory`