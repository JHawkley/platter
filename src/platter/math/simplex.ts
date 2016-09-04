import { BaseVector } from './vector';
import { removeAt, insertAt } from '../utils/array';
import { hasValue } from 'common/monads';

/**
 * Describes a simplex, a structure with up-to 3 points, used for GJK collision tests.
 * 
 * @class Simplex
 * @template T
 */
class Simplex<T extends BaseVector> {

  /**
   * The points of the simplex.
   * 
   * @readonly
   * @type {Array<T>}
   */
  readonly points: Array<T>;

  /**
   * The number of points currently making up the simplex.
   * 
   * @readonly
   * @type {number}
   */
  get count(): number { return this.points.length; }

  /**
   * The first point of the simplex.
   * The vector is not copied; the simplex will assume ownership of any point set.
   * 
   * @type {T}
   */
  get a(): T { return this.points[0]; }
  set a(val: T) {
    let pt = this.points[0];
    if (val !== pt) {
      if (hasValue(pt)) pt.release();
      this.points[0] = val;
    }
  }

  /**
   * The second point of the simplex.
   * The vector is not copied; the simplex will assume ownership of any point set.
   * 
   * @type {T}
   */
  get b(): T { return this.points[1]; }
  set b(val: T) {
    let points = this.points;
    let pt = points[1], hv = hasValue(pt);
    if (!hv && points.length < 1)
      throw new Error('cannot set point `b`; point `a` does not yet exist');
    if (val !== pt) {
      if (hv) pt.release();
      points[1] = val;
    }
  }

  /**
   * The third point of the simplex.
   * The vector is not copied; the simplex will assume ownership of any point set.
   * 
   * @type {T}
   */
  get c(): T { return this.points[2]; }
  set c(val: T) {
    let points = this.points;
    let pt = points[2], hv = hasValue(pt);
    if (!hv && points.length < 2)
      throw new Error('cannot set point `c`; point `b` does not yet exist');
    if (val !== pt) {
      if (hv) pt.release();
      points[2] = val;
    }
  }

  /**
   * Creates a new `Simplex`, allocating a new instance only if none is
   * available in the object-pool.
   * 
   * @static
   * @template T
   * @param {T} [a] A point to add to the fresh simplex.
   * @returns
   */
  static create<T extends BaseVector>(a?: T) { return new Simplex<T>(a); }

  /**
   * Reclaims a simplex, returning it to the pool.
   * 
   * @static
   * @param {Simplex} obj The instance to reclaim.
   */
  static reclaim<T extends BaseVector>(obj: Simplex<T>) { obj.clear(); }

  /**
   * Creates an instance of `Simplex`.
   * 
   * @param {T} [a] A point to add to the new simplex.
   */
  constructor(a?: T) {
    this.points = [];
    if (hasValue(a)) this.add(a);
  }

  /**
   * Releases the `Simplex` instance, returning it to the object pool.
   */
  release() { Simplex.reclaim(this); }

  /**
   * Creates a copy of the simplex.
   * 
   * @returns {Simplex}
   */
  copy(): Simplex<T> {
    let points = this.points;
    let retVal = Simplex.create<T>();
    for (let i = 0, len = points.length; i < len; i++)
      retVal.points.push(points[i].copy<T>());
    return retVal;
  }

  /**
   * Adds the given point as point `a` of the simplex.
   * All other points are pushed back to the next position.
   * 
   * @param {T} p The point to add.
   * @returns {this}
   */
  add(p: T, copy = false): this {
    let points = this.points;
    if (copy) p = p.copy<T>();
    points.unshift(p);
    return this;
  }

  /**
   * Inserts the given point at the given index.
   * All points at `idx` and after will be pushed back one.
   * 
   * @param {T} p The point to insert.
   * @param {number} idx The index to insert into.
   * @returns {this}
   */
  insert(p: T, idx: number, copy = false): this {
    if (idx >= 3)
      throw new Error('index out of range; must always be less than 3');
    let points = this.points;
    if (copy) p = p.copy<T>();
    insertAt(points, p, idx);
    return this;
  }

  /**
   * Removes the first point of the simplex.
   * If it exists, `b` becomes the new `a`.
   * 
   * @returns {this}
   */
  removeA(): this {
    if (this.points.length < 1) return this;
    (this.points.shift() as T).release();
    return this;
  }

  /**
   * Removes the second point of the simplex.
   * If it exists, `c` becomes the new `b`.
   * 
   * @returns {this}
   */
  removeB(): this {
    let points = this.points;
    if (points.length < 2) return this;
    points[1].release();
    removeAt(points, 1);
    return this;
  }

  /**
   * Removes the third point of the simplex.
   * 
   * @returns {this}
   */
  removeC(): this {
    let points = this.points;
    if (points.length < 3) return this;
    points[2].release();
    removeAt(points, 2);
    return this;
  }

  /**
   * Terminates the simplex, removing 
   * 
   * @returns {this}
   */
  terminate(): this {
    let points = this.points;
    if (points.length > 3)
      points.length = 3;
    return this;
  }

  /**
   * Clears all points from the simplex.
   * 
   * @returns {this}
   */
  clear(): this {
    let points = this.points;
    for (let i = 0, len = points.length; i < len; i++)
      points[i].release();
    points.length = 0;
    return this;
  }
}

export default Simplex;