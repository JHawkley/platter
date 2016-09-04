import { set, setXY, add, sub, mul } from './vector-math';
import { length, makeLength, angle, rotate } from './vector-math';
import { unit, perpR, perpL, dot, cross } from './vector-math';
import { project, angleBetween, equals } from './vector-math';
import VectorLike from '../types/vector-like';
import { hasValue } from 'common/monads';

let wv = { x: 0, y: 0 };
let spawn = () => ImmutableVector.create(wv.x, wv.y);

abstract class BaseVector {

  /**
   * The `x` component of the vector.
   * 
   * @type {number}
   */
  x: number;

  /**
   * The `y` component of the vector.
   * 
   * @type {number}
   */
  y: number;

  /**
   * The length of the vector.
   * 
   * @type {number}
   */
  length: number;

  /**
   * The angle of the vector, in radians.
   * 
   * @type {number}
   */
  angle: number;

  /**
   * Tests if two vectors are identical to each other.
   * Always returns `false` if any argument is `null` or `undefined`.
   * 
   * @static
   * @param {VectorLike} a The first vector.
   * @param {VectorLike} b The second vector.
   * @returns
   */
  static equals(a: VectorLike, b: VectorLike) { return equals(a, b); }

  /**
   * Initializes an instance of `BaseVector`.
   * 
   * @param {number} x The `x` component.
   * @param {number} y The `y` component.
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Releases the `BaseVector` instance, returning it to the object pool,
   * if it is able.
   */
  abstract release(): void;

  /**
   * Returns a new vector of the same underlying type that is the result of
   * adding the operand to this vector.
   * 
   * @abstract
   * @param {VectorLike} op The operand to subtract.
   * @returns {BaseVector}
   */
  abstract add(op: VectorLike): BaseVector;


  /**
   * Returns a new vector of the same underlying type that is the result of
   * subtracting the operand from this vector.
   * 
   * @abstract
   * @param {VectorLike} op The operand to subtract.
   * @returns {BaseVector}
   */
  abstract sub(op: VectorLike): BaseVector;
  
  /**
   * Returns a new vector of the same underlying type that is the result of
   * multiplying this vector by a scalar value.
   * 
   * @abstract
   * @param {number} scalar The scalar to multiply the vector by.
   * @returns {BaseVector}
   */
  abstract mul(scalar: number): BaseVector;
  
  /**
   * Returns a new vector of the same underlying type that is the result of
   * rotating this vector by a given ammount, in radians.
   * 
   * @abstract
   * @param {number} ra The angle, in radians, to rotate the vector.
   * @returns {BaseVector}
   */
  abstract rotate(ra: number): BaseVector;
  
  /**
   * Returns a new vector of the same underlying type that is the unit length of
   * this vector.
   * 
   * @abstract
   * @returns {BaseVector}
   */
  abstract unit(): BaseVector;

  /**
   * Returns a new vector that is the result of projecting some `other` vector
   * onto this vector.
   * 
   * @abstract
   * @param {VectorLike} other The vector being projected onto this vector.
   * @returns {BaseVector}
   */
  abstract project(other: VectorLike): BaseVector;

  /**
   * Returns a new vector that is the right-handed perpendicular of this vector.
   * 
   * @abstract
   * @returns {BaseVector}
   */
  abstract perp(): BaseVector;

  /**
   * Returns a new vector that is the right perpendicular of this vector.
   * 
   * @abstract
   * @returns {BaseVector}
   */
  abstract perpR(): BaseVector;

  /**
   * Returns a new vector that is the left perpendicular of this vector.
   * 
   * @abstract
   * @returns {BaseVector}
   */
  abstract perpL(): BaseVector;

  /**
   * Calculates the dot-product of this vector and the given operand.
   * 
   * @param {VectorLike} op The operand to calculate the dot-product with.
   * @returns {number}
   */
  dot(op: VectorLike): number { return dot(this, op); }

  /**
   * Calculates the cross-product of this vector and the given operand.
   * 
   * @param {VectorLike} op The operand to calculate the cross-product with.
   * @returns {number}
   */
  cross(op: VectorLike): number { return cross(this, op); }

  /**
   * Calculates the projection scalar of some `other` vector projected onto
   * this vector.
   * 
   * @param {VectorLike} other The vector being projected onto this vector.
   * @returns {number}
   */
  projectionScalar(other: VectorLike): number { return project(other, this); }

  /**
   * Calculates the angle, in radians, between this vector and some `other` vector.
   * 
   * @param {VectorLike} other The other vector to calculate an angle for.
   * @returns {number}
   */
  angleBetween(other: VectorLike): number { return angleBetween(this, other); }
  
  /**
   * Returns a new vector of the same underlying type that is identical to this vector.
   * 
   * @abstract
   * @template T
   * @returns {T}
   */
  abstract copy<T extends BaseVector>(): T;

  /**
   * Tests if another vector is equal to this vector.
   * 
   * @param {VectorLike} other The other vector to compare against.
   * @returns {boolean}
   */
  equalTo(other: VectorLike): boolean { return equals(this, other); }
  
  /**
   * Returns a new `MutableVector` that is identical to this vector.
   * 
   * @returns {MutableVector}
   */
  asMutable(): MutableVector { return MutableVector.create(this.x, this.y); }
  
  /**
   * Returns a new `ImmutableVector` that is identical to this vector.
   * 
   * @returns {ImmutableVector}
   */
  asImmutable(): ImmutableVector { return ImmutableVector.create(this.x, this.y); }
}

class ImmutableVector extends BaseVector {

  /**
   * The `x` component of the vector.
   * 
   * @readonly
   * @type {number}
   */
  readonly x: number;

  /**
   * The `y` component of the vector.
   * 
   * @readonly
   * @type {number}
   */
  readonly y: number;

  /**
   * The length of the vector.
   * 
   * @readonly
   * @type {number}
   */
  readonly length: number;

  /**
   * The angle of the vector, in radians.
   * 
   * @readonly
   * @type {number}
   */
  readonly angle: number;
  
  /**
   * Creates a new `ImmutableVector`.
   * This method always allocates a new object, as this class cannot be pooled
   * due to being immutable; this method is only here for compliance with the
   * Poolable interface.
   * 
   * @static
   * @param {number} [x=0] The `x` component.
   * @param {number} [y=0] The `y` component.
   * @returns {ImmutableVector}
   */
  static create(x?: number, y?: number): ImmutableVector { return new ImmutableVector(x, y); }
  
  /**
   * Reclaims a `ImmutableVector`, returning it to the pool.
   * As this type is immutable, it can't be pooled, and this method actually
   * does nothing; it's only here for compliance with the Poolable interface.
   * 
   * @static
   * @param {ImmutableVector} instance The instance to reclaim.
   */
  static reclaim(instance: ImmutableVector) { return; }

  /**
   * Creates an instance of `ImmutableVector`.
   * 
   * @param {number} [x=0] The `x` component.
   * @param {number} [y=0] The `y` component.
   */
  constructor(x = 0, y = 0) {
    super(x, y);
    this.length = length(this);
    this.angle = angle(this);
    if (this.constructor === ImmutableVector)
      Object.freeze(this);
  }

  /**
   * Releases the `ImmutableVector` instance.
   * As this type is immutable, it can't be pooled, and this method actually
   * does nothing; it's only here for compliance with the Poolable interface.
   */
  release() { return; }

  /**
   * Returns a new `ImmutableVector` that is the result of adding the
   * operand to this vector.
   * 
   * @param {VectorLike} op The operand to add.
   * @returns {ImmutableVector}
   */
  add(op: VectorLike): ImmutableVector { add(wv, this, op); return spawn(); }

  /**
   * Returns a new `ImmutableVector` that is the result of subtracting the
   * operand from this vector.
   * 
   * @param {VectorLike} op The operand to subtract.
   * @returns {ImmutableVector}
   */
  sub(op: VectorLike): ImmutableVector { sub(wv, this, op); return spawn(); }

  /**
   * Returns a new `ImmutableVector` that is the result of multiplying
   * this vector by a scalar value.
   * 
   * @param {number} scalar The scalar to multiply the vector by.
   * @returns {ImmutableVector}
   */
  mul(scalar: number): ImmutableVector { mul(wv, this, scalar ); return spawn(); }

  /**
   * Returns a new `ImmutableVector` that is the result of rotating this vector
   * by a given ammount, in radians.
   * 
   * @param {number} ra The angle, in radians, to rotate the vector.
   * @returns {ImmutableVector}
   */
  rotate(ra: number): ImmutableVector { rotate(wv, this, ra); return spawn(); }

  /**
   * Returns a new `ImmutableVector` that is the unit length of this vector.
   * 
   * @returns {ImmutableVector}
   */
  unit(): ImmutableVector { unit(wv, this); return spawn(); }

  /**
   * Returns a new vector that is the result of projecting some `other` vector
   * onto this vector.
   * 
   * @abstract
   * @param {VectorLike} other The vector being projected onto this vector.
   * @returns {ImmutableVector}
   */
  project(other: VectorLike): ImmutableVector {
    mul(wv, this, project(other, this));
    return spawn();
  }

  /**
   * Returns a new vector that is the right perpendicular of this vector.
   * 
   * @abstract
   * @returns {ImmutableVector}
   */
  perp(): ImmutableVector {
    perpR(wv, this);
    return spawn();
  }

  /**
   * Returns a new vector that is the right perpendicular of this vector.
   * 
   * @abstract
   * @returns {ImmutableVector}
   */
  perpR(): ImmutableVector {
    perpR(wv, this);
    return spawn();
  }

  /**
   * Returns a new vector that is the left perpendicular of this vector.
   * 
   * @abstract
   * @returns {ImmutableVector}
   */
  perpL(): ImmutableVector {
    perpL(wv, this);
    return spawn();
  }

  /**
   * Returns an `ImmutableVector` that is identical to this vector.
   * Note: Because this type is immutable, this simply returns itself.
   * 
   * @returns {ImmutableVector}
   */
  copy(): ImmutableVector { return this; }

  /**
   * Returns an `ImmutableVector` that is identical to this vector.
   * Note: Because this type is immutable, this simply returns itself.
   * 
   * @returns {ImmutableVector}
   */
  asImmutable(): ImmutableVector { return this; }

  /**
   * Returns a string representation of the vector.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.math.ImmutableVector({x: ${this.x}, y: ${this.y}})]`; }
}

class MutableVector extends BaseVector {
  
  /**
   * The length of the vector.
   * 
   * @type {number}
   */
  get length(): number { return length(this); }
  set length(val: number) { makeLength(this, this, val); }

  /**
   * The angle of the vector, in radians.
   * 
   * @type {number}
   */
  get angle(): number { return angle(this); }
  set angle(a: number) { rotate(this, this, a - angle(this)); }

  /**
   * Creates a new `MutableVector`, allocating a new instance only if none is
   * available in the object-pool.
   * 
   * @static
   * @param {number} [x=0] The `x` component.
   * @param {number} [y=0] The `y` component.
   * @returns {MutableVector}
   */
  static create(x?: number, y?: number): MutableVector { return new MutableVector(x, y); }
  
  /**
   * Reclaims a `MutableVector`, returning it to the pool.
   * 
   * @static
   * @param {MutableVector} instance The instance to reclaim.
   */
  static reclaim(instance: MutableVector) { return; }

  /**
   * Creates an instance of `MutableVector`.
   * 
   * @param {number} [x=0] The `x` component.
   * @param {number} [y=0] The `y` component.
   */
  constructor(x = 0, y = 0) {
    super(x, y);
  }

  /**
   * Releases the `MutableVector` instance, returning it to the object pool.
   */
  release() { MutableVector.reclaim(this); }

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
   * Adds this vector to the given operand.
   * 
   * @param {VectorLike} op The operand to add.
   * @returns {this}
   */
  addEq(op: VectorLike): this { return add(this, this, op); }

  /**
   * Subtracts this vector by the given operand.
   * 
   * @param {VectorLike} op The operand to subtract.
   * @returns {this}
   */
  subEq(op: VectorLike): this { return sub(this, this, op); }

  /**
   * Multiplies this vector by a scalar value.
   * 
   * @param {number} scalar The scalar to multiply the vector by.
   * @returns {this}
   */
  mulEq(scalar: number): this { return mul(this, this, scalar); }

  /**
   * Sets this vector's `x` and `y` values to those of the given vector.
   * 
   * @param {VectorLike} other The vector from which to copy.
   * @returns {this}
   */
  set(other: VectorLike): this { return set(this, other); }

  /**
   * Sets this vector's `x` and `y` values to those given.
   * 
   * @param {number} x The `x` component.
   * @param {number} y The `y` component.
   * @returns {this}
   */
  setXY(x: number, y: number): this { return setXY(this, x, y); }

  /**
   * Rotates this vector by the given amount, in radians.
   * 
   * @param {number} ra The angle, in radians, to rotate the vector.
   * @returns {this}
   */
  rotateSelf(ra: number): this { return rotate(this, this, ra); }

  /**
   * Returns a new `MutableVector` that is identical to this vector.
   * 
   * @returns {MutableVector}
   */
  copy(): MutableVector { return MutableVector.create(this.x, this.y); }

  /**
   * Returns a string representation of the vector.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.math.MutableVector({x: ${this.x}, y: ${this.y}})]`; }
}

const zeroVector = ImmutableVector.create(0, 0);

export { BaseVector, ImmutableVector, MutableVector, zeroVector };
export default MutableVector;