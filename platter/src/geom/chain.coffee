`import Factory from '../factory/base'`
`import Node from '../space/node'`
`import Primative from './primative'`
`import { methods as primativeMethods } from './primative'`
`import ChainLink from './chain-link'`
`import findBounds from '../utils/find-bounds'`
`import { iteratorSymbol } from '../utils/es6'`

isArray = (obj) -> Object::toString.call(obj) is '[object Array]'

comparePoints = (pt1, pt2) -> return switch
  when not (pt1? and pt2?) then false
  when pt1.x isnt pt2.x then false
  when pt1.y isnt pt2.y then false
  else true

typeGroup = Node.addType 'chain'

chainFactory = new Factory class extends Primative
  
  Object.defineProperty @prototype, 'x',
    get: -> @_data.rect.x
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.rect.y
    
  Object.defineProperty @prototype, 'links',
    get: -> @_instanceData.links

  constructor: ->
    super()
    nextHash = {}
    prevHash = {}
    links = []
    prevLink = null
    curLink = null
    for gen in @_data.links
      curLink = gen.create(this)
      if prevLink?
        prevHash[curLink.id] = prevLink
        nextHash[prevLink.id] = curLink
      links.push curLink
      prevLink = curLink
    if @_data.closed
      firstLink = links[0]
      prevHash[firstLink.id] = curLink
      nextHash[curLink.id] = firstLink
    
    Object.freeze(prevHash)
    Object.freeze(nextHash)
    Object.freeze(links)
    
    @_instanceData = { links, prevHash, nextHash }
    Object.freeze(@_instanceData)
  
  destroy: ->
    link.release() for link in @_instanceData.links
    @_instanceData = null
    super()
  
  this.prototype[iteratorSymbol] = ->
    nextIndex = 0
    links = @links
    
    return {
       next: -> switch nextIndex
         when links.length then { value: undefined, done: true }
         else { value: links[nextIndex++], done: false }
    }
  
  getNext: (ref) -> @_instanceData.nextHash[ref.id]
  getPrev: (ref) -> @_instanceData.prevHash[ref.id]
  toRect: -> @_data.rect
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
  # Creates chain-link generators for use by the constructor.
  # This ensures the chain-links also share information.
  links:
    init: -> @links = []
    seal: ->
      { x: offX, y: offY } = this
      links = @links
      lastPoint = null
      for curPoint in @points
        if lastPoint?
          generator = ChainLink.define()
            .translate(offX, offY)
            .points(lastPoint, curPoint)
            .group(@filter.group)
            .mask(@filter.mask)
            .seal()
          links.push generator
        lastPoint = curPoint
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
  # Provides the node type.
  type:
    finalize: -> @type = typeGroup

for k, v of primativeMethods
  chainFactory.method(k, v)
for k, v of methods
  chainFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default chainFactory`