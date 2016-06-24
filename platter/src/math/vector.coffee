`import { set, setXY, add, sub, mul, length, makeLength, angle, rotate, unit, dot, cross } from './vector-math'`

class Vector

  # Preperation for object-pooling.
  @init: (instance, x, y) ->
    instance.x = x ? 0
    instance.y = y ? 0
  @create: (x, y) -> new Vector(x, y)
  @reclaim: (obj) -> return
  release: -> Vector.reclaim(this)

  Object.defineProperty @prototype, 'length',
    get: -> length(this)
    set: (val) -> makeLength(this, this, val)
    enumerable: true
  
  Object.defineProperty @prototype, 'angle',
    get: -> angle(this)
    set: (a) -> rotate(this, this, a - angle(this))
    enumerable: true

  constructor: (x, y) -> Vector.init(this, x, y)
  
  # Operators that generate a new vector.
  #
  # NOTE: Returns a vector of the same type.
  add: (op) -> add(Vector.create(), this, op)
  sub: (op) -> sub(Vector.create(), this, op)
  mul: (scalar) -> mul(Vector.create(), this, scalar)
  rotate: (ra) -> rotate(Vector.create(), this, ra)
  unit: -> unit(Vector.create(), this)
  dot: (op) -> dot(this, op)
  cross: (op) -> cross(this, op)
  
  # Operators that mutate the current vector.
  addEq: (op) -> add(this, this, op)
  subEq: (op) -> sub(this, this, op)
  mulEq: (scalar) -> mul(this, this, scalar)
  set: (other) -> set(this, other)
  setXY: (x, y) -> setXY(this, x, y)
  rotateSelf: (ra) -> rotate(this, this, ra)
  
  copy: -> Vector.create(@x, @y)
  asMutable: -> Vector.create(@x, @y)
  asImmutable: -> ImmutableVector.create(@x, @y)
  
  toString: -> "Platter.math.MutableVector({x: #{@x}, y: #{@y}})"

class ImmutableVector extends Vector

  wv = { x: 0, y: 0 }
  spawn = -> ImmutableVector.create(wv.x, wv.y)

  # Immutable vectors can't be pooled, but we'll permit the interface
  # for consistency with other vector types.
  @create: (x, y) -> new ImmutableVector(x, y)
  @reclaim: -> return
  release: -> return
  
  constructor: (x, y) ->
    super(x, y)
    Object.freeze(this)
  
  copy: -> this
  asImmutable: -> this
  
  add: (op) -> add(wv, this, op); return spawn()
  sub: (op) -> sub(wv, this, op); return spawn()
  mul: (scalar) -> mul(wv, this, scalar); return spawn()
  rotate: (ra) -> rotate(wv, this, ra); return spawn()
  unit: -> unit(wv, this); return spawn()

  addEq: -> throw new Error('vector is immutable')
  subEq: -> throw new Error('vector is immutable')
  mulEq: -> throw new Error('vector is immutable')
  set: -> throw new Error('vector is immutable')
  setXY: -> throw new Error('vector is immutable')
  rotateSelf: -> throw new Error('vector is immutable')
  
  toString: -> "Platter.math.ImmutableVector({x: #{@x}, y: #{@y}})"

`export { Vector as MutableVector }`
`export { ImmutableVector }`
`export default Vector`