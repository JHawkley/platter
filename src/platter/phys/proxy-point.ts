import { hasValue } from 'common/monads';
import VectorLike from '../types/vector-like';
import Primative from '../geom/primative';
import { Point } from '../geom/point';
import ProxyBase from './proxy-base';
import Node from '../space/node';
import { Dynamic } from '../space/dynamic';
import Matrix from '../math/matrix';
import Rect from '../math/rect';
import CollisionFrame from './collision-frame';
import { set, setXY } from '../math/vector-math';
import { point as pointSupport } from '../geom/support-functions';

const wm = new Matrix();
function translationIterator(anc: Node) {
  // Don't apply the world's translation.
  if (anc.parent) wm.translateXY(anc.x, anc.y);
}

class ProxyPoint extends ProxyBase<VectorLike> {

  static create(owner: CollisionFrame, proxied: Primative, standIn: VectorLike): ProxyPoint;
  static create(owner: CollisionFrame, proxied: Point): ProxyPoint;
  static create(owner: CollisionFrame, proxied: Primative, standIn: VectorLike = <Point> proxied) {
    let instance = new ProxyPoint();
    return ProxyPoint.init(instance, owner, proxied, standIn);
  }

  static init(instance: ProxyPoint, owner: CollisionFrame, proxied: Primative, geometry: VectorLike) {
    ProxyBase.init(instance, owner, proxied, geometry);

    let flipX = false, flipY = false, cp = instance.currentPos;
    let parent = proxied.parent;
    if (hasValue(parent))
      if (parent instanceof Dynamic)
        ({ flipX, flipY } = parent);
    let { x, y } = geometry;
    setXY(cp, flipX ? -x : x, flipY ? -y : y);
    wm.reset();
    proxied.iterateUpToRoot(translationIterator);
    wm.applyToPoint(cp);

    return instance;
  }

  static reclaim(instance: ProxyPoint) { return; }

  /**
   * Gets a support point for MPR collision calculations, using the given vector `v`,
   * and setting the result to the vector `out`.
   * 
   * @template T
   * @param {T} out The vector to which the result will be set.
   * @param {VectorLike} v The vector direction of the support point to locate.
   * @returns {T}
   */
  support<T extends VectorLike>(out: T, v: VectorLike): T {
    return pointSupport(out, this.currentPos, v);
  }

  /**
   * Obtains the center-point of the primative, setting it to the given vector `out`.
   * This is the center of the object's bulk, not its center-of-mass.  It can be thought
   * of as the center of the bounding-box that would encompass the primative.
   * 
   * @template T
   * @param {T} out The vector to which the result will be set.
   * @returns {T}
   */
  centerOf<T extends VectorLike>(out: T): T {
    return set(out, this.currentPos);
  }

  /**
   * Calculates the primative's bounding box and sets the result to the given
   * rectangle `out`.
   * 
   * @template T
   * @param {T} out The rectangle to which the result will be set.
   * @returns {T}
   */
  toRect<T extends Rect>(out: T): T {
    let cp = this.currentPos;
    return out.setProps(cp.x, cp.y, 0, 0);
  }

  toString() {
    let { x, y } = this.currentPos;
    return `[object Platter.phys.ProxyPoint#${this.id}({x: ${x}, y: ${y}})]`;
  }
}

export default ProxyPoint;