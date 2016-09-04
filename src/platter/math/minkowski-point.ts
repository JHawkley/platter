import { add, sub, mul } from './vector-math';
import { length, angle, rotate } from './vector-math';
import { unit, perpR, perpL, dot } from './vector-math';
import { project, } from './vector-math';

import { BaseVector, MutableVector } from './vector';
import VectorLike from '../types/vector-like';

interface ISupported {
  support<T extends VectorLike>(out: T, v: VectorLike): T;
  centerOf<T extends VectorLike>(out: T): T;
}

/**
 * A special kind of vector used in GJK calculations.
 * Calculates the difference between two points from different
 * shapes, and stores those points for later reference.
 * 
 * Although this class is mutable, it is not intended to be
 * mutated.  It is mutable for pooling purposes.
 * 
 * @class MinkowskiPoint
 * @extends {BaseVector}
 */
class MinkowskiPoint extends BaseVector {
  
  /**
   * The contributed point from the first shape.
   */
  s1: MutableVector;

  /**
   * The contributed point from the second shape.
   */
  s2: MutableVector;

  /**
   * The length of the vector.
   * 
   * @type {number}
   */
  get length(): number { return length(this); }

  /**
   * The angle of the vector, in radians.
   * 
   * @type {number}
   */
  get angle(): number { return angle(this); }

  /**
   * Creates a new `MinkowskiPoint`, allocating a new instance only if none is
   * available in the object-pool.
   * 
   * @static
   * @param {VectorLike} s1 The point contributed by the first shape.
   * @param {VectorLike} s2 The point contributed by the second shape.
   * @returns {MinkowskiPoint}
   */
  static create(s1: VectorLike, s2: VectorLike): MinkowskiPoint {
    return new MinkowskiPoint(s1, s2);
  }

  /**
   * Reclaims a `MinkowskiPoint`, returning it to the pool.
   * 
   * @static
   * @param {MinkowskiPoint} instance
   */
  static reclaim(instance: MinkowskiPoint) {
    instance.s1.release();
    instance.s1 = null as any;
    instance.s2.release();
    instance.s2 = null as any;
  }

  /**
   * Creates an instance of `MinkowskiPoint`.
   * 
   * @param {VectorLike} s1 The point contributed by the first shape.
   * @param {VectorLike} s2 The point contributed by the second shape.
   */
  constructor(s1: VectorLike, s2: VectorLike) {
    let x = s1.x - s2.x;
    let y = s1.y - s2.y;
    super(x, y);
    this.s1 = MutableVector.create(s1.x, s1.y);
    this.s2 = MutableVector.create(s2.x, s2.y);
  }

  /**
   * Releases the `MinkowskiPoint` instance.
   * As this type is immutable, it can't be pooled, and this method actually
   * doesn't really do anything; it's only here for compliance with the
   * Poolable interface.
   */
  release() { MinkowskiPoint.reclaim(this); }

  /**
   * Returns a new `MutableVector` that is the result of adding the
   * operand to this vector.
   * 
   * @param {VectorLike} op The operand to subtract.
   * @returns {MutableVector}
   */
  add(op: VectorLike): MutableVector { return add(MutableVector.create(), this, op); }

  /**
   * Returns a new `MutableVector` that is the result of subtracting the
   * operand from this vector.
   * 
   * @param {VectorLike} op The operand to subtract.
   * @returns {MutableVector}
   */
  sub(op: VectorLike): MutableVector { return sub(MutableVector.create(), this, op); }

  /**
   * Returns a new `MutableVector` that is the result of multiplying
   * this vector by a scalar value.
   * 
   * @param {number} scalar The scalar to multiply the vector by.
   * @returns {MutableVector}
   */
  mul(scalar: number): MutableVector { return mul(MutableVector.create(), this, scalar); }

  /**
   * Returns a new `MutableVector` that is the result of rotating this vector
   * by a given ammount, in radians.
   * 
   * @param {number} ra The angle, in radians, to rotate the vector.
   * @returns {MutableVector}
   */
  rotate(ra: number): MutableVector { return rotate(MutableVector.create(), this, ra); }

  /**
   * Returns a new `MutableVector` that is the unit length of this vector.
   * 
   * @returns {MutableVector}
   */
  unit(): MutableVector { return unit(MutableVector.create(), this); }

  /**
   * Returns a new vector that is the result of projecting some `other` vector
   * onto this vector.
   * 
   * @abstract
   * @param {VectorLike} other The vector being projected onto this vector.
   * @returns {MutableVector}
   */
  project(other: VectorLike): MutableVector {
    return mul(MutableVector.create(), this, project(other, this));
  }

  /**
   * Returns a new vector that is the right perpendicular of this vector.
   * 
   * @abstract
   * @returns {MutableVector}
   */
  perp(): MutableVector {
    return perpR(MutableVector.create(), this);
  }

  /**
   * Returns a new vector that is the right perpendicular of this vector.
   * 
   * @abstract
   * @returns {MutableVector}
   */
  perpR(): MutableVector {
    return perpR(MutableVector.create(), this);
  }

  /**
   * Returns a new vector that is the left perpendicular of this vector.
   * 
   * @abstract
   * @returns {MutableVector}
   */
  perpL(): MutableVector {
    return perpL(MutableVector.create(), this);
  }

  /**
   * Returns a `MinkowskiPoint` that is identical to this point.
   * 
   * @returns {MinkowskiPoint}
   */
  copy(): MinkowskiPoint { return MinkowskiPoint.create(this.s1, this.s2); }

  /**
   * Returns a string representation of the point.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.math.MinkowskiPoint({x: ${this.x}, y: ${this.y}})]`; }
}

export default MinkowskiPoint;