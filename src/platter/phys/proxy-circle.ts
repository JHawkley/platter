import { hasValue } from 'common/monads';
import VectorLike from '../types/vector-like';
import CircleLike from '../types/circle-like';
import Primative from '../geom/primative';
import { Circle } from '../geom/circle';
import ProxyBase from './proxy-base';
import Node from '../space/node';
import { Kinematic } from '../space/kinematic';
import Matrix from '../math/matrix';
import Rect from '../math/rect';
import { set, setXY } from '../math/vector-math';
import { circle as circleSupport } from '../geom/support-functions';

const wm = new Matrix();
function translationIterator(anc: Node) {
  // Don't apply the world's translation.
  if (anc.parent) wm.translateXY(anc.x, anc.y);
}

class ProxyCircle extends ProxyBase<CircleLike> {

  get radius(): number { return this.geometry.radius; }

  static create(owner: any, proxied: Primative, standIn: CircleLike): ProxyCircle;
  static create(owner: any, proxied: Circle): ProxyCircle;
  static create(owner: any, proxied: Primative, standIn: CircleLike = <Circle> proxied) {
    let instance = new ProxyCircle();
    return ProxyCircle.init(instance, owner, proxied, standIn);
  }

  static init(instance: ProxyCircle, owner: any, proxied: Primative, geometry: CircleLike) {
    instance.owner = owner;
    instance.proxied = proxied;
    instance.geometry = geometry;

    let flipX = false, flipY = false, cp = instance.currentPos;
    let parent = proxied.parent;
    if (hasValue(parent))
      if (parent instanceof Kinematic)
        ({ flipX, flipY } = parent);
    let { x, y } = geometry;
    setXY(cp, flipX ? -x : x, flipY ? -y : y);
    wm.reset();
    proxied.iterateUpToRoot(translationIterator);
    wm.applyToPoint(cp);

    return instance;
  }

  static reclaim(instance: ProxyCircle) { return; }

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
    return circleSupport(out, this, v);
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
    let { id, x, y, radius } = this;
    return `[object Platter.phys.ProxyCircle#${id}({x: ${x}, y: ${y}}, radius: ${radius})]`;
  }
}

export default ProxyCircle;