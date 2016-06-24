`import Vector from '../math/vector'`
`import Simplex from '../geom/simplex'`
`import { add, sub, mul, makeLength, dot, set } from '../math/vector-math'`
`import q from '../utils/tolerant-compare'`
`import config from '../config'`

# Intersection Features
# - Intersection Test (true)
# - Collision Normal
# - Penetration (negative distance)
# - Minimum Translation Vector (collision normal * penetration)
# - Separation Translation Vector
#     Given a vector, indicating a direction, returns a vector
#     with the same angle that will separate the two shapes.
#
# Non-Intersecting Features
# - Intersection Test (false)
# - Closest Points
# - Distance (negative penetration)
# - Collision Vector
#     Given a vector indicating the direction of A toward B,
#     returns the maximum distance that A may travel before
#     colliding with B, or if no collision, just returns a
#     copy of the input vector.

class MinkowskiPoint extends Vector
  # Preperation for object-pooling.
  @init: (instance, A, B, v) ->
    _data = instance._data
    if v?
      # Create point from shapes.
      d = v.asMutable()
      _data.s1 = p1 = A.support(d)
      _data.s2 = p2 = B.support(mul(d, d, -1))
      d.release()
    else
      # Create from given vectors.
      _data.s1 = p1 = A.copy()
      _data.s2 = p2 = B.copy()
    Vector.init(instance, p1.x - p2.x, p1.y - p2.y)
  @create: (shape1, shape2, v) -> new MinkowskiPoint(shape1, shape2, v)
  @reclaim: (obj) ->
    _data = obj._data
    _data.s1.release()
    _data.s2.release()
    _data.s1 = _data.s2 = null
    
  release: -> MinkowskiPoint.reclaim(this)
  
  # Support point contribution from shape 1.
  Object.defineProperty @prototype, 's1',
    get: -> @_data.s1
  
  # Support point contribution from shape 2.
  Object.defineProperty @prototype, 's2',
    get: -> @_data.s2
  
  constructor: (shape1, shape2, v) ->
    @_data = { s1: null, s2: null }
    MinkowskiPoint.init(this, shape1, shape2, v)
  
  copy: -> MinkowskiPoint.create(@s1, @s2)
  
  toString: -> "MinkowskiPoint({x: #{@s1.x} - #{@s2.x} = #{@x}, y: #{@s1.y} - #{@s2.y} = #{@y}})"

tripleProduct = (a, b, c) ->
  bac = mul(Vector.create(), b, dot(a, c))
  cab = mul(Vector.create(), c, dot(a, b))
  
  sub(bac, bac, cab)
  cab.release()
  
  return bac

containsOrigin = (simplex, d) ->
  retVal = false
  { a, b } = simplex
  ao = mul(Vector.create(), a, -1)
  ab = sub(Vector.create(), b, a)
  
  if simplex.points.length is 3
    c = simplex.c
    ac = sub(Vector.create(), c, a)
    
    abPerp = tripleProduct(ac, ab, ab)
    if dot(abPerp, ao) > 0
      simplex.removeC()
      set(d, abPerp)
    else
      acPerp = tripleProduct(ab, ac, ac)
      if dot(acPerp, ao) > 0
        simplex.removeB()
        set(d, acPerp)
      else
        retVal = true
      acPerp.release()
    ac.release()
  else
    abPerp = tripleProduct(ab, ao, ab)
    set(d, abPerp)
  
  ao.release(); ab.release(); abPerp.release()
  return retVal

closestToOrigin: (a, b) -> if a.length < b.length then a else b

class CollisionResult

  Object.defineProperty @prototype, 'intersecting',
    get: -> @testIntersecting()
  
  Object.defineProperty @prototype, 'colliding',
    get: -> @testDistance() <= -config.touchingTolerance
    
  Object.defineProperty @prototype, 'normal',
    get: -> @testNormal()
  
  Object.defineProperty @prototype, 'penetration',
    get: -> -(@testDistance())
  
  Object.defineProperty @prototype, 'mtv',
    get: -> @testMTV()
  
  Object.defineProperty @prototype, 'distance',
    get: -> @testDistance()
  
  Object.defineProperty @prototype, 'closestA',
    get: -> @testClosest().closestA
  
  Object.defineProperty @prototype, 'closestB',
    get: -> @testClosest().closestB
  
  constructor: (a, b) ->
    @shape1 = a
    @shape2 = b
    @_data =
      haveIntersection: false
      haveMTV: false
      haveDistance: false
      haveClosest: false
      
      intersecting: false
      normal: Vector.create()
      mtv: Vector.create()
      distance: 0
      closestA: null
      closestB: null
      simplex: null
  
  invalidate: ->
    data = @_data
    data.haveIntersection = false
    data.haveNormal = false
    data.haveDistance = false
    data.haveClosest = false
    
    data.simplex?.release()
    data.closestA?.release()
    data.closestB?.release()
    data.simplex = data.closestA = data.closestB = null
  
  support: (v) -> MinkowskiPoint.create(@shape1, @shape2, v)
  
  testIntersecting: ->
    data = @_data
    return data.intersecting if data.haveIntersection
    
    c1 = @shape1.getCenter()
    c2 = @shape2.getCenter()
    # `c2` is redefined to `d`, so we don't release `c2`.
    d = sub(c2, c2, c1)
    c1.release()
    
    data.simplex = simplex = Simplex.create @support(d)
    mul(d, d, -1)
    
    retVal = false
    
    loop
      simplex.add @support(d)
      if dot(simplex.a, d) <= 0
        retVal = false
        break
      if containsOrigin(simplex, d)
        retVal = true
        break
    
    d.release()
    
    data.haveIntersection = true
    return data.intersecting = retVal
  
  testDistance: ->
    data = @_data
    return data.distance if data.haveDistance
    
    simplex = data.simplex
    
    if @testIntersecting()
      # Negated penetration.
    else
      # Separated distance.
      simplex.removeC() if simplex.length is 3
      d = Vector.create()
      loop
        p = closestToOrigin(simplex.a, simplex.b)
        
        # Are we touching?
        len = p.length
        if len < config.touchingTolerance
          data.distance = len
          break
        
        mul(d, p, -1)
        makeLength(d, d, 1)
        
        c = @support(d)
        
        dc = dot(c, d)
        da = dot(simplex.a, d)
        
        if dc - da < config.touchingTolerance
          c.release()
          data.distance = dc
          break
        if a.length < b.length
          simplex.b = c
        else
          simplex.a = c
      d.release()
    data.haveDistance = true
    return data.distance
  
  testClosest: ->
    data = @_data
    
    return data if data.haveClosest or @testIntersecting()
    # Need the termination simplex after finding the distance.
    @testDistance()
    
    L = sub(Vector.create(), simplex.b, simplex.a)
    
    # Are we touching (almost identical support points from both shapes)?
    if L.length <= config.touchingTolerance
      data.closestA = simplex.a.s1.copy()
      data.closestB = simplex.a.s2.copy()
      L.release()
      return data
    
    LdotL = dot(L, L)
    LdotA = dot(simplex.a, L)
    lambda1 = -LdotA/LdotL
    lambda2 = 1 - lambda1
    
    if lambda1 < 0
      data.closestA = simplex.b.s1.copy()
      data.closestB = simplex.b.s2.copy()
    else if lambda2 < 0
      data.closestA = simplex.a.s1.copy()
      data.closestB = simplex.a.s2.copy()
    else
      v1 = Vector.create()
      v2 = Vector.create()
      mul(v1, simplex.a.s1, lambda1)
      mul(v2, simplex.b.s1, lambda2)
      data.closestA = add(Vector.create(), v1, v2)
      
      mul(v1, simplex.a.s2, lambda1)
      mul(v2, simplex.b.s2, lambda2)
      data.closestB = add(Vector.create(), v1, v2)
      
      v1.release()
      v2.release()
    L.release()
    return data