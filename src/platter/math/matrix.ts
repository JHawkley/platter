import { MutableVector as Vector } from './vector';
import lerp from '../utils/lerp';
import comp from '../utils/tolerant-compare';
import VectorLike from '../types/vector-like';

/*
 * Matrix implementation based on an implementation © 2014-2015 Epistemex.
 * Original code authored by Ken Fyrstenberg & leeoniya.
 * Distributed under MIT License.
 * https://github.com/epistemex/transformation-matrix-js
 */

type PolygonLike = { points: Array<VectorLike> };
type Decomposition = { translate: Vector, scale: Vector, skew: Vector, rotation: number };
let { sqrt, cos, acos, sin, tan, atan, atan2, PI } = Math;

// Working vectors.
let wv1 = Vector.create();
let wv2 = Vector.create();
let wv3 = Vector.create();

// Working matrix; initialized after class declaration.
let wm: Matrix;

class Matrix {

  /**
   * The `x` component of scale.
   * 
   * @type {number}
   */
  a: number;
  
  /**
   * The `y` component of shear.
   * 
   * @type {number}
   */
  b: number;
  
  /**
   * The `x` component of shear.
   * 
   * @type {number}
   */
  c: number;
  
  /**
   * The `y` component of scale.
   * 
   * @type {number}
   */
  d: number;
  
  /**
   * The `x` component of translation.
   * 
   * @type {number}
   */
  e: number;
  
  /**
   * The `y` component of translation.
   * 
   * @type {number}
   */
  f: number;

  /**
   * The determinant of the current matrix.
   * 
   * @readonly
   * @type {number}
   */
  get determinant(): number { return this.a * this.d - this.b * this.c; }

  /**
   * Whether the matrix is invertible.
   * 
   * @readonly
   * @type {boolean}
   */
  get isInvertible(): boolean { return !comp(this.determinant, 0); }

  /**
   * Whether the matrix is an identity matrix (no transforms applied).
   * 
   * @readonly
   * @type {boolean}
   */
  get isIdentity(): boolean {
    return (
      comp(this.a, 1) && comp(this.b, 0) && comp(this.c, 0) &&
      comp(this.d, 1) && comp(this.e, 0) && comp(this.f, 0)
    );
  }

  /**
   * The property is intended for situations where scale is accumulated
	 * via multiplications, to detect situations where scale becomes
	 * "trapped" with a value of zero. And in which case scale must be
	 * set explicitly to a non-zero value.
   * 
   * @readonly
   * @type {boolean}
   */
  get isValid(): boolean { return !(this.a * this.d); }

  /**
   * Creates an instance of `Matrix`.
   * 
   */
  constructor() { this.a = this.d = 1; this.b = this.c = this.e = this.f = 0; }

  /**
   * Concatenates transforms of the given matrix to this instance.
   * 
   * @param {Matrix} cm The matrix from which transforms will be sourced.
   * @returns {this}
   */
  concat(cm: Matrix): this { return this.transform(cm.a, cm.b, cm.c, cm.d, cm.e, cm.f); }

  /**
   * Flips the horizontal values.
   * 
   * @returns {this}
   */
  flipX(): this { return this.transform(-1, 0, 0, 1, 0, 0); }

  /**
   * Flips the vertical values.
   * 
   * @returns {this}
   */
  flipY(): this { return this.transform(1, 0, 0, -1, 0, 0); }

  /**
   * Reflects incoming (velocity) vector on the normal which will be the
   * current transformed `x` axis.  Call when a trigger condition is met.
   * 
   * NOTE: If only the `out` argument is provided, `out` will be transformed
   * and modified in-place.
   * 
   * @template T
   * @param {T} out The vector into which to copy the reflection.
   * @param {VectorLike} [v=out] The vector to be reflected.
   * @returns {T}
   */
  reflectVector<T extends VectorLike>(out: T, v: VectorLike = out): T {
    this.applyToPoint(wv1.setXY(0, 1));
    let d = 2 * (wv1.x * v.x + wv1.y * v.y);
    out.x = v.x - (d * wv1.x);
    out.y = v.y - (d * wv1.y);
    return out;
  }

  /**
   * Short-hand to reset current matrix to an identity matrix.
   * 
   * @returns {this}
   */
  reset(): this { return this.setTransform(1, 0, 0, 1, 0, 0); }

  /**
   * Rotates current matrix accumulative by `angle`, in radians.
   * 
   * @param {number} angle The angle to rotate, in radians.
   * @returns {this}
   */
  rotate(angle: number): this {
    let c = cos(angle);
    let s = sin(angle);
    return this.transform(c, s, -s, c, 0, 0);
  }

  /**
   * Converts a vector given as x and y to angle, and rotates (accumulative).
   * 
   * @param {VectorLike} v The vector to use for rotation.
   * @returns {this}
   */
  rotateFromVector(v: VectorLike): this { return this.rotate(atan2(v.y, v.x)); }

  /**
   * Helper method to make a rotation based on an `angle` in degrees.
   * 
   * @param {number} angle The angle to rotate, in degrees.
   * @returns {this}
   */
  rotateDeg(angle: number): this { return this.rotate(angle * PI / 180); }

  /**
   * Scales current matrix, accumulative.
   * 
   * @param {number} sx The amount of scale on the `x` axis.
   * @param {number} sy The amount of scale on the `y` axis.
   * @returns {this}
   */
  scale(sx: number, sy: number): this { return this.transform(sx, 0, 0, sy, 0, 0); }

  /**
   * Scales current matrix uniformly and accumulatively.
   * 
   * @param {number} s The scalar value to scale by.
   * @returns {this}
   */
  scaleU(s: number): this { return this.scale(s, s); }

  /**
   * Scales current matrix on the `x` axis, accumulative.
   * 
   * @param {number} sx The amount of scale on the `x` axis.
   * @returns {this}
   */
  scaleX(sx: number): this { return this.scale(sx, 1); }

  /**
   * Scales current matrix on the `y` axis, accumulative.
   * 
   * @param {number} sy The amount of scale on the `y` axis.
   * @returns {this}
   */
  scaleY(sy: number): this { return this.scale(1, sy); }

  /**
   * Apply shear to the current matrix, accumulative.
   * 
   * @param {number} sx The amount of shear on the `x` axis.
   * @param {number} sy The amount of shear on the `y` axis.
   * @returns {this}
   */
  shear(sx: number, sy: number): this { return this.transform(1, sy, sx, 1, 0, 0); }

  /**
   * Apply shear for the `x` axis to the current matrix, accumulative.
   * 
   * @param {number} sx The amount of shear on the `x` axis.
   * @returns {this}
   */
  shearX(sx: number): this { return this.shear(sx, 0); }

  /**
   * Apply shear for the `y` axis to the current matrix, accumulative.
   * 
   * @param {number} sy The amount of shear on the `y` axis.
   * @returns {this}
   */
  shearY(sy: number): this { return this.shear(0, sy); }

  /**
   * Apply skew to the current matrix, accumulative.
   * 
   * @param {number} ax The amount of skew on the `x` axis.
   * @param {number} ay The amount of skew on the `y` axis.
   * @returns {this}
   */
  skew(ax: number, ay: number): this { return this.shear(tan(ax), tan(ay)); }

  /**
   * Apply skew for the `x` axis to the current matrix, accumulative.
   * 
   * @param {number} ax The amount of skew on the `x` axis.
   * @returns {this}
   */
  skewX(ax: number): this { return this.shearX(tan(ax)); }

  /**
   * Apply skew for the `y` axis to the current matrix, accumulative.
   * 
   * @param {number} ay The amount of skew on the `y` axis.
   * @returns {this}
   */
  skewY(ay: number): this { return this.shearY(tan(ay)); }

  /**
   * Set current matrix to new absolute matrix.
   * 
   * @param {number} a The `x` component of scale.
   * @param {number} b The `y` component of shear.
   * @param {number} c The `x` component of shear.
   * @param {number} d The `y` component of scale.
   * @param {number} e The `x` component of translation.
   * @param {number} f The `y` component of translation.
   * @returns {this}
   */
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): this {
    return (this.a = a, this.b = b, this.c = c, this.d = d, this.e = e, this.f = f, this);
  }

  /**
   * Translate current matrix using a vector, accumulative.
   * 
   * @param {VectorLike} v A vector describing the amount of translation.
   * @returns {this}
   */
  translate(v: VectorLike): this { return this.transform(1, 0, 0, 1, v.x, v.y); }

  /**
   * Translate current matrix, accumulative.
   * 
   * @param {number} tx The amount of translation on the `x` axis.
   * @param {number} ty The amount of translation on the `y` axis.
   * @returns {this}
   */
  translateXY(tx: number, ty: number): this { return this.transform(1, 0, 0, 1, tx, ty); }

  /**
   * Translate current matrix on the `x` axis, accumulative.
   * 
   * @param {number} tx The amount of translation on the `x` axis.
   * @returns {this}
   */
  translateX(tx: number): this { return this.translateXY(tx, 0); }

  /**
   * Translate current matrix on the `y` axis, accumulative.
   * 
   * @param {number} ty The amount of translation on the `y` axis.
   * @returns {this}
   */
  translateY(ty: number): this { return this.translateXY(0, ty); }

  /**
   * Multiplies current matrix with new matrix values.
   * 
   * @param {number} a2 The `x` component of scale.
   * @param {number} b2 The `y` component of shear.
   * @param {number} c2 The `x` component of shear.
   * @param {number} d2 The `y` component of scale.
   * @param {number} e2 The `x` component of translation.
   * @param {number} f2 The `y` component of translation.
   * @returns {this}
   */
  transform(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number): this {
    let { a: a1, b: b1, c: c1, d: d1, e: e1, f: f1 } = this;

    // Matrix order (canvas compatible):
    // ACE
    // BDF
    // 001

    this.a = a1 * a2 + c1 * b2;
    this.b = b1 * a2 + d1 * b2;
    this.c = a1 * c2 + c1 * d2;
    this.d = b1 * c2 + d1 * d2;
    this.e = a1 * e2 + c1 * f2 + e1;
    this.f = b1 * e2 + d1 * f2 + f1;

    return this;
  }

  /**
   * Divide this matrix by the input matrix, which must be invertible.
   * 
   * @param {Matrix} m The divisor matrix.
   * @returns {this}
   */
  divide(m: Matrix): this {
    if (!m.isInvertible)
      throw new Error('divisor matrix is not invertible');
    let im = m.copyTo(wm).invert();
    return this.transform(im.a, im.b, im.c, im.d, im.e, im.f);
  }

  /**
   * Divide current matrix by a scalar value != 0.
   * 
   * @param {number} d The divisor.
   * @returns {this}
   */
  divideScalar(d: number): this {
    this.a /= d; this.b /= d; this.c /= d;
    this.d /= d; this.e /= d; this.f /= d;
    return this;
  }

  /**
   * Inverts the current matrix instance in-place, useful for getting the values
   * you need to calculate an identity matrix.
   * 
   * @returns {this}
   */
  invert(): this {
    if (this.isIdentity) return this;
    if (!this.isInvertible) throw new Error('matrix is not invertible');
    let { a, b, c, d, e, f } = this;
    // this.determinant, skip DRY here...
    let dt = a * d - b * c;

    this.a = d / dt;
    this.b = -b / dt;
    this.c = -c / dt;
    this.d = a / dt;
    this.e = (c * f - d * e) / dt;
    this.f = -(a * f - b * e) / dt;
    return this
  }

  /**
   * Interpolate this matrix with another and produce a new matrix.
   * `t` is a value in the range `(0..1)` where `0` is this instance and
   * `1` is equal to the second matrix. The `t` value is not constrained.
   * 
   * NOTE: This interpolation is naive. For animation use the `interpolateAnim()`
   * method instead.
   * 
   * NOTE: Returns a new matrix instance.
   * 
   * @param {Matrix} m2 The other matrix to interpolate between.
   * @param {number} t A value that linearly interpolates between this matrix and `m2`.
   * @returns {Matrix}
   */
  interpolate(m2: Matrix, t: number): Matrix {
    let m = new Matrix();
    m.a = lerp(this.a, m2.a, t);
    m.b = lerp(this.b, m2.b, t);
    m.c = lerp(this.c, m2.c, t);
    m.d = lerp(this.d, m2.d, t);
    m.e = lerp(this.e, m2.e, t);
    m.f = lerp(this.f, m2.f, t);
    return m;
  }

  /**
   * Interpolate this matrix with another and produce a new matrix.
   * `t` is a value in the range `(0..1)` where `0` is this instance and
   * `1` is equal to the second matrix. The `t` value is not constrained.
   * 
   * NOTE: This interpolation method uses decomposition which makes
   * it suitable for animations (in particular where rotation takes
   * place).
   * 
   * NOTE: Returns a new matrix instance.
   * 
   * @param {Matrix} m2 The other matrix to interpolate between.
   * @param {number} t A value that linearly interpolates between this matrix and `m2`.
   * @returns {Matrix}
   */
  interpolateAnim(m2: Matrix, t: number): Matrix {
    let m = new Matrix();
    let d1 = this.decompose();
    let d2 = m2.decompose();
    let rotation = lerp(d1.rotation, d2.rotation, t);
    let translateX = lerp(d1.translate.x, d2.translate.x, t);
    let translateY = lerp(d1.translate.y, d2.translate.y, t);
    let scaleX = lerp(d1.scale.x, d2.scale.x, t);
    let scaleY = lerp(d1.scale.y, d2.scale.y, t);
    
    m.translateXY(translateX, translateY);
    m.rotate(rotation);
    m.scale(scaleX, scaleY);
    
    return m;
  }

  /**
   * Decompose the current matrix into simple transforms using either
   * QR (default) or LU decomposition. Code adapted from:
   * http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices
   * 
   * @param {boolean} [useLU=false] Whether to use LU decomposition.
   * @returns {Decomposition}
   */
  decompose(useLU = false): Decomposition {
    return useLU ? this.decomposeLU() : this.decomposeQR();
  }

  /**
   * Decompose the current matrix into simple transforms using LU decomposition.
   * 
   * The result must be applied in the following order to reproduce the current matrix:
   * translate -> skewY  -> scale -> skewX
   * 
   * @returns {Decomposition}
   */
  decomposeLU(): Decomposition {
    let { a, b, c, d } = this;
    
    let translate = wv1.setXY(this.e, this.f);
    let scale = wv2.setXY(1, 1);
    let skew = wv3.setXY(0, 0);
    let rotation = 0;
    
    // this.determinant, skip DRY here...
    let determ = a * d - b * c;

    if (a) {
      skew.setXY(atan(c / a), atan(b / a));
      scale.setXY(a, determ / a);
    } else if (b) {
      skew.setXY(atan(c / a), atan(b / a));
      scale.setXY(a, determ / a);
    } else {
      scale.setXY(c, d);
      skew.x = PI * 0.25;
    }
    
    return {
      translate: translate.copy(),
      scale: scale.copy(),
      skew: skew.copy(),
      rotation: rotation
    };
  }

  /**
   * Decompose the current matrix into simple transforms using QR decomposition.
   * 
   * The result must be applied in the following order to reproduce the current matrix:
   * translate -> rotate -> scale -> skewX
   * 
   * @returns {Decomposition}
   */
  decomposeQR(): Decomposition {
    let { a, b, c, d } = this;
    
    let translate = wv1.setXY(this.e, this.f);
    let scale = wv2.setXY(1, 1);
    let skew = wv3.setXY(0, 0);
    let rotation = 0;
    
    // this.determinant, skip DRY here...
    let determ = a * d - b * c;

    if (a || b) {
      let r = sqrt(a*a + b*b);
      rotation = b > 0 ? acos(a / r) : -acos(a / r);
      scale.setXY(r, determ / r);
      skew.x = atan((a*c + b*d) / (r*r));
    } else if (c || d) {
      let s = sqrt(c*c + d*d);
      rotation = PI * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
      scale.setXY(determ / s, s);
      skew.y = atan((a*c + b*d) / (s*s));
    } else {
      // Invalid matrix.
      scale.setXY(0, 0);
    }
    
    return {
      translate: translate.copy(),
      scale: scale.copy(),
      skew: skew.copy(),
      rotation: rotation
    };
  }

  /**
   * Apply current matrix to an `x` and `y` point.
   * NOTE: If only the `out` argument is provided, `out` will be transformed
   * and modified in-place.
   * 
   * @template T
   * @param {T} out The point into which to copy the transformation.
   * @param {VectorLike} [pt=out] The point to be transformed.
   * @returns {T}
   */
  applyToPoint<T extends VectorLike>(out: T, pt: VectorLike = out): T {
    let { x, y } = pt;
    out.x = x * this.a + y * this.c + this.e;
    out.y = x * this.b + y * this.d + this.f;
    return out;
  }

  /**
   * Apply to an array of points.
   * NOTE: Modifies the array and its points in-place.
   * 
   * @template T
   * @param {Array<T>} points The array of points to transform.
   * @returns {Array<T>}
   */
  applyToArray<T extends VectorLike>(points: Array<T>): Array<T> {
    for (let i = 0, len = points.length; i < len; i++)
      this.applyToPoint(points[i]);
    return points;
  }

  /**
   * Apply to a polygon object.
   * NOTE: Modifies the polygon in-place.
   * 
   * @template T
   * @param {T} poly The polygon to transform.
   * @returns {T}
   */
  applyToPoly<T extends PolygonLike>(poly: T): T {
    this.applyToArray(poly.points);
    return poly;
  }

  /**
   * Copies current instance values into the input matrix.
   * NOTE: Returns the input matrix.
   * 
   * @param {Matrix} m The matrix to which this matrix will be copied.
   * @returns {Matrix}
   */
  copyTo(m: Matrix): Matrix { return m.setTransform(this.a, this.b, this.c, this.d, this.e, this.f); }

  /**
   * Clones current instance, returning a new matrix.
   * 
   * @returns {Matrix}
   */
  clone(): Matrix { return this.copyTo(new Matrix()); }

  /**
   * Compares current matrix with another matrix. Returns `true` if equal
   * (within epsilon tolerance).
   * 
   * @param {Matrix} m The matrix to compare this instance to.
   * @returns {boolean}
   */
  isEqual(m: Matrix): boolean {
    return (
      comp(this.a, m.a) && comp(this.b, m.b) && comp(this.c, m.c) &&
      comp(this.d, m.d) && comp(this.e, m.e) && comp(this.f, m.f)
    );
  }

  /**
   * Returns an array with the current matrix values.
   * 
   * @returns {Array<number>}
   */
  toArray(): Array<number> { return [this.a, this.b, this.c, this.d, this.e, this.f]; }

  /**
   * Generates a string that can be used with CSS `transform:`.
   * 
   * @returns {string}
   */
  toCSS(): string { return `matrix(${this.toArray().join(', ')})`; }

  /**
   * Returns an object describing the matrix for use with `JSON.stringify()`.
   * 
   * @returns
   */
  toJSON() { return { a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f }; }

  /**
   * Returns a string describing the current instance.  Helpful for debugging.
   * 
   * @returns {string}
   */
  toString(): string {
    return `[object Matrix({a: ${this.a}, b: ${this.b}, c: ${this.c}, d: ${this.d}, e: ${this.e}, f: ${this.f}})]`;
  }
}

wm = new Matrix();

export default Matrix;