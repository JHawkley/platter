`import Group from './group'`
`import Node from './node'`

class Container extends Group

  typeGroup = Node.addType 'container'
  
  constructor: (x, y) ->
    # Only accepts other groups as children.
    Group.init(this, x, y, (~Node.types['group'] >>> 0), typeGroup)
  
  # Adopts a single node, so long as it is a group.
  adoptObj: (obj) ->
    if obj is this
      throw new Error('a group may not adopt itself')
    type = (obj.type ? 0x00000000)
    if type is 0x00000000 or !!(@_filteredNodeTypes & type)
      throw new Error('object is not a permitted type for this group')
    @children.push obj
    obj.wasAdoptedBy?(this)
  
  toString: -> "Platter.space.Container({x: #{@x}, y: #{@y}})"

`export default Container`