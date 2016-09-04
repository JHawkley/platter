import { Maybe, hasValue, getOrElse } from 'common/monads';
import Primative from '../geom/primative';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import { MutableVector, BaseVector, zeroVector } from '../math/vector';

type IReleasable = { release?: () => void };

abstract class ProxyBase<T> {
  // Location vectors.
  currentPos: BaseVector;
  get x(): number { return this.currentPos.x; }
  get y(): number { return this.currentPos.y; }
  get delta(): Maybe<MutableVector> {
    if (this._delta !== false) this._delta;
    let parent = this.proxied.parent;
    if (hasValue(parent))
      return this._delta = this.owner.getDeltaFor(parent.id);
    else
      return this._delta = null;
  }

  // Geometry.
  geometry: T & IReleasable;

  // Ownership.
  owner: any;
  proxied: Primative;

  // Identification.
  get id(): number { return this.proxied.id; }

  // Private properties.
  private _delta: Maybe<MutableVector> | boolean;

  constructor() {
    this.currentPos = MutableVector.create();
    this._delta = false;
  }

  release(releaseStandInGeometry = true) {
    // If the proxied primative is not the same as the geometry
    // then allow it to be released.
    let geomIsNotProxied = (this.proxied as any !== this.geometry as any);
    if (releaseStandInGeometry && geomIsNotProxied && this.geometry.release)
      this.geometry.release();
    this.geometry = null as any;
    this.owner = null as any;
    this.proxied = null as any;
    this._delta = false;
  }

  getFinalPosition(): MutableVector;
  getFinalPosition<T extends VectorLike>(out: T): T;
  getFinalPosition(out?: VectorLike): VectorLike {
    let cp = this.currentPos;
    let d = getOrElse<BaseVector>(this.delta, zeroVector);
    let x = cp.x + d.x, y = cp.y + d.y;
    if (out) { out.x = x; out.y = y; }
    else out = MutableVector.create(x, y);
    return out;
  }

  /**
   * Gets a support point for MPR collision calculations, using the given vector `v`,
   * and setting the result to the vector `out`.
   * 
   * @abstract
   * @template T
   * @param {T} out The vector to which the result will be set.
   * @param {VectorLike} v The vector direction of the support point to locate.
   * @returns {T}
   */
  abstract support<T extends VectorLike>(out: T, v: VectorLike): T;

  /**
   * Obtains the center-point of the primative, setting it to the given vector `out`.
   * This is the center of the object's bulk, not its center-of-mass.  It can be thought
   * of as the center of the bounding-box that would encompass the primative.
   * 
   * @abstract
   * @template T
   * @param {T} out The vector to which the result will be set.
   * @returns {T}
   */
  abstract centerOf<T extends VectorLike>(out: T): T;

  /**
   * Calculates the primative's bounding box and sets the result to the given
   * rectangle `out`.
   * 
   * @abstract
   * @template T
   * @param {T} out The rectangle to which the result will be set.
   * @returns {T}
   */
  abstract toRect<T extends Rect>(out: T): T;

  toString() {
    let { x, y } = this.currentPos;
    return `[object Platter.phys.ProxyBase#${this.id}({x: ${x}, y: ${y}})]`;
  }
}

export default ProxyBase;