`import Group from './group'`
`import Node from './node'`
`import Vector from '../math/vector'`

class Kinematic extends Group

  typeGroup = Node.addType 'kinematic'
  
  constructor: (x, y, dx, dy) ->
    # Does not accept groups as children.
    Group.init(this, x, y, Node.types['group'], typeGroup)
    @delta = Vector.create(dx ? 0, dy ? 0)
  
  toString: -> "Platter.space.Kinematic({x: #{@x}, y: #{@y}})"

`export default Kinematic`