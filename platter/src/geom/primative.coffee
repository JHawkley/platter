`import Node from '../space/node'`

class Primative extends Node

  Object.defineProperty @prototype, 'x',
    get: -> @_data.x ? 0
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.y ? 0
    
  Object.defineProperty @prototype, 'filter',
    get: -> @_data.filter
  
  constructor: ->
    @_parent = null
  
  toString: -> "Platter.geom.Primative##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Allows the primative to be repositioned.
  translate:
    init: -> @x = 0; @y = 0
    apply: (x, y) -> @x += x; @y += y
  # Handles sealing of the collision filter information.
  filter:
    init: -> @filter = { group: 0x00000000, mask: 0x00000000 }
    seal: -> Object.freeze(@filter)
  # Sets the filter group.
  group:
    apply: (flags) -> @filter.group = @filter.group | flags
  # Sets the mask group.
  mask:
    apply: (flags) -> @filter.mask = @filter.mask | flags

`export { methods }`
`export default Primative`