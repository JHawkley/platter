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
  dimension:
    apply: (@width, @height) -> return
    finalize: ->
      if not (@width? and @height?) or @width <= 0 or @height <= 0
        throw new Error('a dimension must be provided')
  type:
    finalize: -> @type = typeGroup

for k, v of primativeMethods
  aabbFactory.method(k, v)
for k, v of methods
  aabbFactory.method(k, v)

`export { methods }`
`export default aabbFactory`