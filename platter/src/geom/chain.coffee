`import Factory from '../factory/base'`
`import CallbackType from '../callback/type'`
`import Primative from './primative'`
`import { methods as nodeMethods } from '../space/node'`
`import { methods as primativeMethods } from './primative'`
`import ChainLink from './chain-link'`
`import findBounds from '../utils/find-bounds'`
`import { iteratorSymbol } from '../utils/es6'`
`import { isArray } from '../utils/array'`
`import { chain as type } from './_type'`

comparePoints = (pt1, pt2) -> return switch
  when not (pt1? and pt2?) then false
  when pt1.x isnt pt2.x then false
  when pt1.y isnt pt2.y then false
  else true

chainFactory = new Factory class extends Primative
  
  @init: (instance) ->
    nextHash = {}
    prevHash = {}
    links = []
    prevLink = null
    curLink = null
    for gen in instance._data.links
      curLink = gen.create(instance)
      if prevLink?
        prevHash[curLink.id] = prevLink
        nextHash[prevLink.id] = curLink
      links.push curLink
      prevLink = curLink
    if instance._data.closed
      firstLink = links[0]
      prevHash[firstLink.id] = curLink
      nextHash[curLink.id] = firstLink
    
    Object.freeze(prevHash)
    Object.freeze(nextHash)
    Object.freeze(links)
    
    instanceData = { links, prevHash, nextHash }
    Object.freeze(instanceData)
    
    instance._instanceData = instanceData
  
  Object.defineProperty @prototype, 'x',
    get: -> @_data.rect.x
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.rect.y
    
  Object.defineProperty @prototype, 'links',
    get: -> @_instanceData.links

  constructor: -> super()
  
  destroy: ->
    link.release() for link in @_instanceData.links
    @_instanceData = null
    super()
  
  # We can't use a support function on this type of shape, because
  # it can be concave.  Instead, the chain-link support functions
  # should be used instead, individually.
  support: -> throw new Error('not supported')
  
  this.prototype[iteratorSymbol] = ->
    nextIndex = 0
    links = @links
    results = {}
    
    return {
      next: ->
        switch nextIndex
          when links.length
            results.value = undefined
            results.done = true
          else
            results.value = links[nextIndex++]
            results.done = false
        return results
    }
  
  getNext: (ref) -> @_instanceData.nextHash[ref.id]
  getPrev: (ref) -> @_instanceData.prevHash[ref.id]
  toRect: (out) -> out.set(@_data.rect); return out
  toString: -> "Platter.geom.Chain##{@id}({links.length: #{@links.length}})"

methods =
  # Adds points to the definition and handles their checks and sealing.
  points:
    init: -> @points = []
    apply: ->
      throw new Error('cannot add points to a closed shape') if @closed
      points = if isArray(arguments[0]) then arguments[0] else arguments
      @points.push point for point in points
      return
    finalize: ->
      # Remove duplicate points.
      lastPoint = null
      i = 0
      while i < @points.length
        curPoint = @points[i]
        if comparePoints(lastPoint, curPoint)
          @points.splice(i, 1)
        else
          i += 1
        lastPoint = curPoint
      if @points.length <= 1
        throw new Error('not enough points to create a single chain')
      if @closed and @points.length <= 3
        throw new Error('not a closed polygon; more a line or point')
    seal: ->
      Object.freeze(point) for point in @points
      Object.freeze(@points)
  # Adds a single point to the chain.
  add:
    apply: ->
      throw new Error('cannot add points to a closed shape') if @closed
      switch arguments.length
        when 1
          {x, y} = arguments[0]
        when 2
          [x, y] = arguments
        else
          throw new Error('invalid arguments')
      @points.push {x, y}
  # Closes the loop, creating a polygon.
  close:
    init: -> @closed = false
    apply: -> 
      throw new Error('already closed the shape') if @closed
      points = @points
      [firstPoint, _..., lastPoint] = points
      # Try to catch some obvious construction errors.
      switch
        when comparePoints(firstPoint, lastPoint)
          if points.length <= 3
            throw new Error('not a closed polygon; more a line or point')
        else
          if points.length <= 2
            throw new Error('not enough points to create a closed polygon')
          points.push firstPoint
      @closed = true
    finalize: ->
      return if @closed
      [firstPoint, _..., lastPoint] = @points
      if comparePoints(firstPoint, lastPoint)
        if @points.length <= 3
          throw new Error('not a closed polygon; more a line or point')
        @closed = true
  # Reverses the winding of the points.  Helpful if your level editor
  # exports them in clock-wise order.
  reverse:
    init: -> @reversed = false
    apply: -> @reversed = true
  # Creates chain-link generators for use by the constructor.
  # This ensures the chain-links also share information.
  links:
    init: -> @links = []
    seal: ->
      { x: offX, y: offY } = this
      links = @links
      lastPoint = null
      for curPoint in @points by (if @reversed then -1 else 1)
        if lastPoint?
          generator = ChainLink.define()
            .translate(offX, offY)
            .points(lastPoint, curPoint)
            .type(@chainType)
            .seal()
          links.push generator
        lastPoint = curPoint
      delete @chainType
      Object.freeze(links)
  # Provides an appropriate rectangle bounding box.
  rectangle:
    finalize: ->
      top = left = Number.POSITIVE_INFINITY
      bottom = right = Number.NEGATIVE_INFINITY
      for point in @points
        {x, y} = point
        top = Math.min(top, y)
        left = Math.min(left, x)
        bottom = Math.max(bottom, y)
        right = Math.max(right, x)
      @rect =
        x: left + @x
        y: top + @y
        width: right - left
        height: bottom - top
    seal: -> Object.freeze(@rect)
  # Adds special capabilities for creating chain-links.
  type:
    init: ->
      nodeMethods.type.init.call(this)
      @chainType = []
    apply: (cbType) ->
      nodeMethods.type.apply.call(this, cbType)
      if isArray(cbType)
        @chainType.push(cbType...)
      else
        @chainType.push cbType
    seal: -> nodeMethods.type.seal.call(this)
  # Provides the node type.
  typeGroup:
    finalize: -> @type.push type

for k, v of nodeMethods when k isnt 'type'
  chainFactory.method(k, v)
for k, v of primativeMethods
  chainFactory.method(k, v)
for k, v of methods
  chainFactory.method(k, v)

`export { methods, type }`
`export default chainFactory`