class Vector

  # Preperation for object-pooling.
  @init: (instance, x, y) ->
    _data = instance._data
    _data.x = x ? 0
    _data.y = y ? 0
    instance.validate()
  @create: (x, y) -> new Vector(x, y)
  @reclaim: (obj) -> return
  release: -> Vector.reclaim(this)
  
  Object.defineProperty @prototype, 'x',
    get: -> @_data.x
    set: (val) ->
      @_data.x = val
      @validate()
    enumerable: true
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.y
    set: (val) ->
      @_data.y = val
      @validate()
    enumerable: true

  Object.defineProperty @prototype, 'length',
    get: -> @_data.length
    set: (val) ->
      _data = @_data
      switch
        when val < 0 then throw new Error('length must not be less than 0')
        when val is 0 then _data.x = 0; _data.y = 0
        when _data.x is 0 and _data.y is 0 then _data.y = val
        else
          scalar = val / _data.length
          _data.x *= scalar
          _data.y *= scalar
      @validate()
    enumerable: true
  
  Object.defineProperty @prototype, 'angle',
    get: -> @_data.angle
    set: (a) -> @rotateSelf(a - @_data.angle)
    enumerable: true

  constructor: (x, y) ->
    @_data = {}
    Vector.init(this, x, y)
  
  validate: ->
    _data = @_data
    { x, y } = _data
    _data.length = Math.sqrt(x*x + y*y)
    _data.angle = Math.atan2(x, y)
  
  # Operators that generate a new vector.
  #
  # NOTE: Returns a vector of the same type.
  add: (op) -> @constructor.create(@_data.x + op.x, @_data.y + op.y)
  sub: (op) -> @constructor.create(@_data.x - op.x, @_data.y - op.y)
  mul: (scalar) -> @constructor.create(@_data.x * scalar, @_data.y * scalar)
  rotate: (ra) ->
    x = @_data.x; y = @_data.y; ra *= -1
    ax = Math.sin(ra)
    ay = Math.cos(ra)
    return @constructor.create(x * ay - y * ax, x * ax + y * ay)
  unit: -> l = @_data.length; return @constructor.create(@_data.x / l, @_data.y / l)
  
  # Operators that mutate the current vector.
  addEq: (op) -> @_data.x += op.x; @_data.y += op.y; @validate(); return this
  subEq: (op) -> @_data.x -= op.x; @_data.y -= op.y; @validate(); return this
  mulEq: (scalar) -> @_data.x *= scalar; @_data.y *= scalar; @validate(); return this
  set: (other) -> @_data.x = other.x; @_data.y = other.y; @validate(); return this
  setXY: (x, y) -> @_data.x = x; @_data.y = y; @validate(); return this
  rotateSelf: (ra) ->
    _data = @_data
    { x, y } = _data; ra *= -1
    ax = Math.sin(ra)
    ay = Math.cos(ra)
    _data.x = x * ay - y * ax
    _data.y = x * ax + y * ay
    @validate()
    return this
  
  copy: -> Vector.create(@_data.x, @_data.y)
  asMutable: -> Vector.create(@_data.x, @_data.y)
  asImmutable: -> ImmutableVector.create(@_data.x, @_data.y)
  
  toString: -> "Platter.math.MutableVector({x: #{@_data.x}, y: #{@_data.y}})"

class ImmutableVector extends Vector

  # Immutable vectors can't be pooled, but we'll permit the interface
  # for consistency with other vector types.
  @create: (x, y) -> new ImmutableVector(x, y)
  @reclaim: -> return
  release: -> return
  
  constructor: (x, y) ->
    super(x, y)
    Object.freeze(@_data)
  
  copy: -> this
  asImmutable: -> this

  addEq: -> throw new Error('vector is immutable')
  subEq: -> throw new Error('vector is immutable')
  mulEq: -> throw new Error('vector is immutable')
  set: -> throw new Error('vector is immutable')
  setXY: -> throw new Error('vector is immutable')
  rotateSelf: -> throw new Error('vector is immutable')
  
  toString: -> "Platter.math.ImmutableVector({x: #{@_data.x}, y: #{@_data.y}})"

class SimpleVector
  constructor: (@x, @y) -> Object.freeze(this)
  asMutable: -> Vector.create(@x, @y)
  asImmutable: -> ImmutableVector.create(@x, @y)
  toString: -> "Platter.math.SimpleVector({x: #{@x}, y: #{@y}})"

`export { Vector as MutableVector }`
`export { ImmutableVector }`
`export { SimpleVector }`
`export default Vector`