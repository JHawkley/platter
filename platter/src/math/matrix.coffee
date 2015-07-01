`import Vector from './vector'`
`import q from '../utils/tolerant-compare'`

# Matrix implementation based on an implementation © 2014-2015 Epistemex.
# Original code authored by Ken Fyrstenberg & leeoniya.
# Distributed under MIT License.
# https://github.com/epistemex/transformation-matrix-js

# Working vectors.
wv1 = new Vector(0, 0)
wv2 = new Vector(0, 0)
wv3 = new Vector(0, 0)

# Working matrix (initialized at end of file).
wm = null

class Matrix

  Object.defineProperty @prototype, 'determinant',
    get: -> @a * @d - @b * @c
  
  Object.defineProperty @prototype, 'isInvertible',
    get: -> not q(@determinant, 0)
  
  Object.defineProperty @prototype, 'isIdentity',
    get: ->
      return q(@a, 1) and q(@b, 0) and q(@c, 0) and
             q(@d, 1) and q(@e, 0) and q(@f, 0)
  
  Object.defineProperty @prototype, 'isValid',
    get: -> not q(@a * @d, 0)

  constructor: ->
    @a = @d = 1
    @b = @c = @e = @f = 0
  
  # Concatenates transforms of the given matrix to this instance.
  #
  # NOTE: Alters the matrix in-place.
  concat: (cm) -> @transform(cm.a, cm.b, cm.c, cm.d, cm.e, cm.f)
  
  # Flips the horizontal values.
  flipX: -> @transform(-1, 0, 0, 1, 0, 0)
  
  # Flips the vertical values.
  flipY: -> @transform(1, 0, 0, -1, 0, 0)
  
  # Reflects incoming (velocity) vector on the normal which will be the
  # current transformed x axis. Call when a trigger condition is met.
  #
  # NOTE: BETA, simple implementation
  # NOTE: Alters the vector in-place.
  reflectVector: (v) ->
    @applyToPoint(wv1.set(0, 1))
    d = 2 * (wv1.x * v.x + wv1.y * v.y)
    v.x -= d * wv1.x
    v.y -= d * wv1.y
    
    return v
  
  # Short-hand to reset current matrix to an identity matrix.
  reset: -> @setTransform(1, 0, 0, 1, 0, 0)
  
  # Rotates current matrix accumulative by `angle` (in radians).
  rotate: (angle) ->
    cos = Math.cos(angle)
    sin = Math.sin(angle)
    @transform(cos, sin, -sin, cos, 0, 0)
  
  # Converts a vector given as x and y to angle, and rotates (accumulative).
  rotateFromVector: (v) -> @rotate(Math.atan2(v.y, v.x))
  
  # Helper method to make a rotation based on an `angle` in degrees.
  rotateDeg: (angle) -> @rotate(angle * Math.PI / 180)
  
  # Scales current matrix accumulative.
  scale: (sx, sy) -> @transform(sx, 0, 0, sy, 0, 0)
  
  # Scales current matrix uniformly and accumulative.
  scaleU: (f) -> @scale(f, f)
  
  # Scales current matrix on x axis accumulative.
  scaleX: (sx) -> @scale(sx, 1)
  
  # Scales current matrix on y axis accumulative.
  scaleY: (sy) -> @scale(1, sy)
  
  # Apply shear to the current matrix accumulative.
  shear: (sx, sy) -> @transform(1, sy, sx, 1, 0, 0)
  
  # Apply shear for x to the current matrix accumulative.
  shearX: (sx) -> @shear(sx, 0)
  
  # Apply shear for y to the current matrix accumulative.
  shearY: (sy) -> @shear(0, sy)
  
  # Apply skew to the current matrix accumulative.
  skew: (ax, ay) -> @shear(Math.tan(ax), Math.tan(ay))
  
  # Apply skew for x to the current matrix accumulative.
  skewX: (ax) -> @shearX(Math.tan(ax))
  
  # Apply skew for y to the current matrix accumulative.
  skewY: (ay) -> @shearY(Math.tan(ay))
  
  # Set current matrix to new absolute matrix.
  setTransform: (@a, @b, @c, @d, @e, @f) -> return this
  
  # Translate current matrix accumulative.
  translate: (tx, ty) -> @transform(1, 0, 0, 1, tx, ty)
  
  # Translate current matrix on x axis accumulative.
  translateX: (tx) -> @translate(tx, 0)
  
  # Translate current matrix on y axis accumulative.
  translateY: (ty) -> @translate(0, ty)
  
  # Multiplies current matrix with new matrix values.
  transform: (a2, b2, c2, d2, e2, f2) ->
    { a: a1, b: b1, c: c1, d: d1, e: e1, f: f1 } = this
    
    # Matrix order (canvas compatible):
    # ACE
    # BDF
    # 001
    
    @a = a1 * a2 + c1 * b2
    @b = b1 * a2 + d1 * b2
    @c = a1 * c2 + c1 * d2
    @d = b1 * c2 + d1 * d2
    @e = a1 * e2 + c1 * f2 + e1
    @f = b1 * e2 + d1 * f2 + f1
    
    return this
  
  # Divide this matrix by the input matrix which must be invertible.
  divide: (m) ->
    throw new Error('divisor matrix is not invertible') unless m.isInvertible
    im = m.copyTo(wm).inverse()
    @transform(im.a, im.b, im.c, im.d, im.e, im.f)
  
  # Divide current matrix by a scalar value != 0.
  divideScalar: (d) ->
    @a /= d; @b /= d; @c /= d
    @d /= d; @e /= d; @f /= d
    return this
  
  # Inverts the current matrix instance, useful for getting the values
  # you need to calculate an identity matrix.
  #
  # NOTE: Alters the matric in-place.
  inverse: -> switch
    when @isIdentity then return this
    when not @isInvertible then throw new Error('matrix is not invertible')
    else
      { a, b, c, d, e, f } = this
      # @determinant, skip DRY here...
      dt = a * d - b * c
     
      @a = d / dt;
      @b = -b / dt;
      @c = -c / dt;
      @d = a / dt;
      @e = (c * f - d * e) / dt;
      @f = -(a * f - b * e) / dt;
      return this
  
  # Interpolate this matrix with another and produce a new matrix.
  # `t` is a value in the range [0.0, 1.0] where 0 is this instance and
  # 1 is equal to the second matrix. The `t` value is not constrained.
  #
  # NOTE: This interpolation is naive. For animation use the
  # intrpolateAnim() method instead.
  interpolate: (m2, t) ->
    m = new Matrix()
    m.a = @a + (m2.a - @a) * t
    m.b = @b + (m2.b - @b) * t
    m.c = @c + (m2.c - @c) * t
    m.d = @d + (m2.d - @d) * t
    m.e = @e + (m2.e - @e) * t
    m.f = @f + (m2.f - @f) * t
    
    return m
  
  # Interpolate this matrix with another and produce a new matrix.
  # `t` is a value in the range [0.0, 1.0] where 0 is this instance and
  # 1 is equal to the second matrix. The `t` value is not constrained.
  #
  # NOTE: This interpolation method uses decomposition which makes
  # it suitable for animations (in particular where rotation takes
  # place).
  interpolateAnim: (m2, t) ->
    m = new Matrix()
    d1 = @decompose()
    d2 = m2.decompose()
    rotation = d1.rotation + (d2.rotation - d1.rotation) * t
    translateX = d1.translate.x + (d2.translate.x - d1.translate.x) * t
    translateY = d1.translate.y + (d2.translate.y - d1.translate.y) * t
    scaleX = d1.scale.x + (d2.scale.x - d1.scale.x) * t
    scaleY = d1.scale.y + (d2.scale.y - d1.scale.y) * t
    
    m.translate(translateX, translateY)
    m.rotate(rotation)
    m.scale(scaleX, scaleY)
    
    return m
  
  # Decompose the current matrix into simple transforms using either
  # QR (default) or LU decomposition. Code adapted from:
  # http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices
  decompose: (useLU = false) -> if useLU then @decomposeLU() else @decomposeQR()
  
  # The result must be applied in the following order to reproduce the current matrix:
  # translate -> skewY  -> scale -> skewX
  decomposeLU: ->
    { a, b, c, d } = this
    { atan, PI } = Math
    
    translate = wv1.set(@e, @f)
    scale = wv2.set(1, 1)
    skew = wv3.set(0, 0)
    rotation = 0
    
    # @determinant, skip DRY here...
    determ = a * d - b * c
    
    switch
      when a
        skew.set(atan(c / a), atan(b / a))
        scale.set(a, determ / a)
      when b
        rotation = PI * 0.5
        scale.set(b, determ / b)
        skew.x = atan(d / b)
      else
        scale.set(c, d)
        skew.x = PI * 0.25
    
    return {
      translate: translate.clone()
      scale: scale.clone()
      skew: skew.clone()
      rotation
    }
  
  # The result must be applied in the following order to reproduce the current matrix:
  # translate -> rotate -> scale -> skewX
  decomposeQR: ->
    { a, b, c, d } = this
    { acos, atan, sqrt, PI } = Math
    
    translate = wv1.set(@e, @f)
    scale = wv2.set(1, 1)
    skew = wv3.set(0, 0)
    rotation = 0
    
    # @determinant, skip DRY here...
    determ = a * d - b * c
    
    switch
      when a, b
        r = sqrt(a*a + b*b)
        rotation = if b > 0 then acos(a / r) else -acos(a / r)
        scale.set(r, determ / r)
        skew.x = atan((a*c + b*d) / (r*r))
      when c, d
        s = sqrt(c*c + d*d)
        rotation = PI * 0.5 - (if d > 0 then acos(-c / s) else -acos(c / s))
        scale.set(determ / s, s)
        skew.y = atan((a*c + b*d) / (s*s))
      else
        # Invalid matrix.
        scale.set(0, 0)
    
    return {
      translate: translate.clone()
      scale: scale.clone()
      skew: skew.clone()
      rotation
    }
  
  # Apply current matrix to an x and y point.
  # NOTE: Modifies the point in-place.
  applyToPoint: (pt) ->
    { x, y } = pt
    pt.x = x * @a + y * @c + @e
    pt.y = x * @b + y * @d + @f
    return pt
  
  # Apply to an array of points.
  # NOTE: Modifies the array and its points in-place.
  applyToArray: (points) ->
    @applyToPoint(point) for point in points
    return points
  
  # Apply to a polygon object.
  # NOTE: Modifies the polygon in-place.
  applyToPoly: (poly) ->
    @applyToArray(poly.points)
    return poly
  
  # Copies current instance values into the input matrix.
  # NOTE: Returns the input matrix.
  copyTo: (m) -> m.setTransform(@a, @b, @c, @d, @e, @f)
  
  # Clones current instance, returning a new matrix.
  clone: -> @copyTo(new Matrix())
  
  # Compares current matrix with another matrix. Returns true if equal
  # (within epsilon tolerance).
  isEqual: (m) ->
    return q(@a, m.a) and q(@b, m.b) and q(@c, m.c) and
           q(@d, m.d) and q(@e, m.e) and q(@f, m.f)
  
  # Returns an array with the current matrix values.
  toArray: -> [@a, @b, @c, @d, @e, @f]
  
  # Generates a string that can be used with CSS `transform:`.
  toCSS: -> "matrix(#{@toArray().join(', ')})"
  
  # Returns an object describing the matrix for use with `JSON.stringify()`.
  toJSON: -> {@a, @b, @c, @d, @e, @f}
  
  # Returns a string describing the current instance.  Helpful for debugging.
  toString: -> "Matrix({a: #{@a}, b: #{@b}, c: #{@c}, d: #{@d}, e: #{@e}, f: #{@f}})"

wm = new Matrix()

`export default Matrix`