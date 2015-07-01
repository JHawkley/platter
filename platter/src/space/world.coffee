`import Group from './group'`
`import Node from './node'`

class World extends Group

  typeGroup = Node.addType 'world'
  
  constructor: (bounds) ->
    throw new Error('argument `bounds` must be provided') unless bounds?
    Group.init(this, bounds.x, bounds.y, null, typeGroup)
    @width = bounds.width ? throw new Error('missing argument: bounds.width')
    @height = bounds.height ? throw new Error('missing argument: bounds.height')
    @time = 0
  
  step: (timeLapsed) ->
    @time += timeLapsed
  
  wasAdoptedBy: -> throw new Error('worlds must remain a root node')
  
  asRect: -> this
  
  toString: -> "Platter.space.World({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

`export default World`