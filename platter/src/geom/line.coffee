`import Factory from '../factory/base'`
`import Primative from './primative'`
`import { methods as nodeMethods } from '../space/node'`
`import { methods as primativeMethods } from './primative'`
`import { MutableVector, ImmutableVector } from '../math/vector'`
`import { set, mul, add } from '../math/vector-math'`
`import { line as support } from './_support'`
`import { line as type } from './_type'`

lineFactory = new Factory class extends Primative
  
  Object.defineProperty @prototype, 'point1',
    get: -> @_data.pt1
  
  Object.defineProperty @prototype, 'point2',
    get: -> @_data.pt2
  
  Object.defineProperty @prototype, 'normal',
    get: -> @_data.normal
    
  Object.defineProperty @prototype, 'grade',
    get: -> @_data.grade
  
  constructor: -> super()
  support: (out, v) -> support(out, this, v)
  centerOf: (out) ->
    set(out, @point1)
    add(out, out, @point2)
    mul(out, out, 0.5)
    return out
  toRect: (out) -> out.set(@_data.rect); return out
  toString: ->
    pt1 = "{x: #{@point1.x}, y: #{@point1.y}}"
    pt2 = "{x: #{@point2.x}, y: #{@point2.y}}"
    return "Platter.geom.Line##{@id}(#{pt1}, #{pt2})"

methods =
  # Sets the first point.
  from:
    apply: ->
      switch arguments.length
        when 1
          {x, y} = arguments[0]
        when 2
          [x, y] = arguments
        else
          throw new Error('invalid arguments')
      @pt1 = {x, y}
  # Sets the second point.
  to:
    apply: (x, y) ->
      switch arguments.length
        when 1
          {x, y} = arguments[0]
        when 2
          [x, y] = arguments
        else
          throw new Error('invalid arguments')
      @pt2 = {x, y}
  # Sets the points that make up the line and handles their
  # checks, translation offsetting, and sealing.
  points:
    apply: ->
      switch arguments.length
        when 2
          [{x: x1, y: y1}, {x: x2, y: y2}] = arguments
        when 4
          [x1, y1, x2, y2] = arguments
        else
          throw new Error('invalid arguments')
      @pt1 = { x: x1, y: y1 }
      @pt2 = { x: x2, y: y2 }
    seal: ->
      { x: offX, y: offY, pt1: {x: x1, y: y1 }, pt2: {x: x2, y: y2} } = this
      if not (x1? and y1? and x2? and y2?)
        throw new Error('points for the line must be provided')
      @pt1 = new ImmutableVector(x1 + offX, y1 + offY)
      @pt2 = new ImmutableVector(x2 + offX, y2 + offY)
      @x = 0; @y = 0
  # Provides a normal and the grade for the line.
  # The grade assumes a character running on the line from
  # left to right, AKA the Mario Standard Direction, or MSD.
  normal:
    finalize: ->
      { pt1: {x: x1, y: y1 }, pt2: {x: x2, y: y2} } = this
      dx = x2 - x1; dy = -(y2 - y1)
      len = Math.sqrt(dy*dy + dx*dx)
      @normal = n = ImmutableVector.create(dy / len, dx / len)
      a = n.angle
      a += Math.PI * 2 if a < 0
      @grade = (a + Math.PI) * -1
  # Provides an appropriate rectangle bounding box.
  rectangle:
    finalize: ->
      { x: offX, y: offY, pt1: {x: x1, y: y1 }, pt2: {x: x2, y: y2} } = this
      x1 += offX; y1 += offY
      x2 += offX; y2 += offY
      @rect =
        x: Math.min(x1, x2)
        y: Math.min(y1, y2)
        width: Math.abs(x1 - x2)
        height: Math.abs(y1 - y2)
    seal: -> Object.freeze(@rect)
  # Provides the node type.
  typeGroup:
    finalize: -> @type.push type

for k, v of nodeMethods
  lineFactory.method(k, v)
for k, v of primativeMethods
  lineFactory.method(k, v)
for k, v of methods
  lineFactory.method(k, v)

`export { methods, type }`
`export default lineFactory`