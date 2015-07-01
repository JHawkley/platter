`import Factory from '../factory/base'`
`import Group from './group'`
`import { methods as groupMethods } from './group'`
`import Node from './node'`

typeGroup = Node.addType 'world'

worldFactory = new Factory class extends Group.ctor

  Object.defineProperty @prototype, 'x',
    get: -> @_data.x
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.y
    
  Object.defineProperty @prototype, 'width',
    get: -> @_data.width
  
  Object.defineProperty @prototype, 'height',
    get: -> @_data.height
  
  constructor: ->
    # Perform setup that the Group and Node constructors
    # would have done.  `x` and `y` are now immutable.
    @_parent = null
    @_rect = {}
    @children = []
    @time = 0
  
  step: (timeLapsed) ->
    @time += timeLapsed
  
  wasAdoptedBy: -> throw new Error('worlds must remain a root node')
  
  toRect: -> this
  
  contentAsRect: -> Group.ctor::toRect.call(this)
  
  toString: ->
    bounds = "{x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}}"
    return "Platter.space.World##{@id}(#{bounds})"

methods =
  # Sets the filter to specifically allow only groups.
  filter:
    init: -> @filter = { allowed: Node.types['group'], excluded: 0x00000000 }
    seal: -> Object.freeze(@filter)
  # Sets the position of the world-space.
  position:
    init: -> @x = 0; @y = 0
    apply: (@x, @y) -> return
  # Sets the dimensions, width and height, of the world space.
  dimension:
    apply: (@width, @height) -> return
    finalize: ->
      if not (@width? and @height?) or @width <= 0 or @height <= 0
        throw new Error('a dimension must be provided')
  # Sets the width of the world space.
  width:
    apply: (@width) -> return
  # Sets the height of the world space.
  height:
    apply: (@height) -> return
  # Provides the node type.
  type:
    finalize: ->
      groupMethods.type.finalize.call(this)
      @type |= typeGroup

# Technically, this blocks all of the group methods,
# but in the future it may not.
for k, v of groupMethods when k not in ['filter', 'allow', 'exclude', 'type']
  worldFactory.method(k, v)
for k, v of methods
  worldFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default worldFactory`