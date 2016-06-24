`import Node from '../space/node'`

class Primative extends Node

  @init: (instance) -> return

  Object.defineProperty @prototype, 'x',
    get: -> @_data.x ? 0
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.y ? 0
    
  Object.defineProperty @prototype, 'filter',
    get: -> @_data.filter
  
  Object.defineProperty @prototype, 'proxy',
    get: -> @_proxy ?= @makeProxy()
  
  constructor: ->
    @_parent = null
    @_proxy = null
  
  destroy: ->
    super()
    if @_proxy?
      @_proxy.release()
      @_proxy = null
  
  support: -> throw new Error('not implemented')
  
  centerOf: -> throw new Error('not implemented')
  
  makeProxy: -> throw new Error('not implemented')
  
  toString: -> "Platter.geom.Primative##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Allows the primative to be repositioned.
  translate:
    init: -> @x = 0; @y = 0
    apply: (x, y) -> @x += x; @y += y

`export { methods }`
`export default Primative`