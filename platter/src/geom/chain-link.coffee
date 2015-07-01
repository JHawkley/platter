`import Factory from '../factory/base'`
`import Node from '../space/node'`
`import Line, {methods as lineMethods} from './line'`
`import { methods as primativeMethods } from './primative'`

typeGroup = Node.addType 'chain-link'

chainLinkFactory = new Factory class extends Line.ctor
  
  Object.defineProperty @prototype, 'host',
    get: -> @_instanceData.host
  
  Object.defineProperty @prototype, 'prev',
    get: -> @_instanceData.host.getPrev(this)
    
  Object.defineProperty @prototype, 'next',
    get: -> @_instanceData.host.getNext(this)
  
  constructor: (host) ->
    super()
    if not host?
      throw new Error('a chain-link requires a chain to host it')
    @_instanceData = { host }
    Object.freeze(@_instanceData)
  
  destroy: ->
    @_instanceData = null
    super()
  
  toString: ->
    pt1 = "{x: #{@point1.x}, y: #{@point1.y}}"
    pt2 = "{x: #{@point2.x}, y: #{@point2.y}}"
    return "Platter.geom.ChainLink##{@id}(#{pt1}, #{pt2})"

methods =
  # Provides the node type.
  type:
    finalize: ->
      lineMethods.type.finalize.call(this)
      @type |= typeGroup

for k, v of primativeMethods
  chainLinkFactory.method(k, v)
for k, v of lineMethods when k isnt 'type'
  chainLinkFactory.method(k, v)
for k, v of methods
  chainLinkFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default chainLinkFactory`