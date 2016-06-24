`import Factory from '../factory/base'`
`import CallbackType from '../callback/type'`
`import Line, { methods as lineMethods } from './line'`
`import { line as lineType } from './_type'`
`import { methods as nodeMethods } from '../space/node'`
`import { methods as primativeMethods } from './primative'`
`import { chainLink as type } from './_type'`

chainLinkFactory = new Factory class extends Line.ctor
  
  @init: (instance, host) ->
    if not host?
      throw new Error('a chain-link requires a chain to host it')
    instance._instanceData = { host }
    Object.freeze(instance._instanceData)
  
  Object.defineProperty @prototype, 'host',
    get: -> @_instanceData.host
  
  Object.defineProperty @prototype, 'prev',
    get: -> @_instanceData.host.getPrev(this)
    
  Object.defineProperty @prototype, 'next',
    get: -> @_instanceData.host.getNext(this)
  
  constructor: -> super()
  
  destroy: ->
    @_instanceData = null
    super()
  
  wasAdoptedBy: ->
    throw new Error('must be hosted by a chain to be in the world tree')
  
  toString: ->
    pt1 = "{x: #{@point1.x}, y: #{@point1.y}}"
    pt2 = "{x: #{@point2.x}, y: #{@point2.y}}"
    return "Platter.geom.ChainLink##{@id}(#{pt1}, #{pt2})"

methods =
  # Provides the node type.
  typeGroup:
    finalize: ->
      lineMethods.typeGroup.finalize.call(this)
      @type.push type

for k, v of nodeMethods
  chainLinkFactory.method(k, v)
for k, v of primativeMethods
  chainLinkFactory.method(k, v)
for k, v of lineMethods when k isnt 'typeGroup'
  chainLinkFactory.method(k, v)
for k, v of methods
  chainLinkFactory.method(k, v)

`export { methods }`
`export default chainLinkFactory`