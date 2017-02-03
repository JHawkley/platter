import { Maybe, hasValue, getOrElse } from 'common/monads';
import Primative from '../geom/primative';
import { Dynamic } from '../space/dynamic';
import { Group } from '../space/group';
import { Node } from '../space/node';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import CollisionFrame from './collision-frame';
import TOIIsland from './toi-island';
import { MutableVector, BaseVector, zeroVector } from '../math/vector';

type IReleasable = { release?: () => void };

abstract class ProxyBase<T> {
  // Location vectors.
  currentPos: BaseVector;
  get x(): number { return this.currentPos.x; }
  get y(): number { return this.currentPos.y; }
  get delta(): Maybe<MutableVector> {
    if (this._delta !== false) this._delta;
    let parent = this._getParent();
    if (hasValue(parent))
      return this._delta = this.owner.getDeltaFor(parent.id);
    else
      return this._delta = null;
  }

  // Geometry.
  geometry: T & IReleasable;

  // Ownership.
  owner: CollisionFrame;
  proxied: Primative;
  get island(): Maybe<TOIIsland> {
    return this.owner.getIslandFor(this.proxied.id);
  }
  set island(value: Maybe<TOIIsland>) {
    this.owner.setIslandFor(this.proxied.id, value);
  }

  // Identification.
  get id(): number { return this.proxied.id; }

  get isDynamic(): boolean {
    return (this._getParent() instanceof Dynamic);
  }

  // Private properties.
  private _delta: Maybe<MutableVector> | boolean;

  static init<T>(instance: ProxyBase<T>, owner: CollisionFrame, proxied: Primative, geometry: T): ProxyBase<T> {
    instance.owner = owner;
    instance.proxied = proxied;
    instance.geometry = geometry;
    return owner.registerAsOwned(instance);
  }

  constructor() {
    this.currentPos = MutableVector.create();
    this.owner = null as any;
    this.proxied = null as any;
    this.geometry = null as any;
    this._delta = false;
  }

  release(releaseStandInGeometry = true) {
    // If the proxied primative is not the same as the geometry
    // then allow it to be released.
    let geomIsNotProxied = (this.proxied as any !== this.geometry as any);
    if (releaseStandInGeometry && geomIsNotProxied && this.geometry.release)
      this.geometry.release();
    this.owner = null as any;
    this.proxied = null as any;
    this.geometry = null as any;
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

  getCollisions(): Array<null> {
    return this.owner.getCollisionsFor(this.proxied.id);
  }

  getCollisionsWith(other: Primative | ProxyBase<any>): Array<null> {
    return this.owner.getCollisionsBetween(this.proxied.id, other.id);
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

  /**
   * Gets the parent for a proxied primative.  This is mostly a helper to
   * deal with chain-links.
   * 
   * @protected
   * @returns {Maybe<Group>}
   */
  protected _getParent(): Maybe<Group> {
    return this.proxied.parent;
  }

  toString() {
    let { x, y } = this.currentPos;
    return `[object Platter.phys.ProxyBase#${this.id}({x: ${x}, y: ${y}})]`;
  }
}

export default ProxyBase;