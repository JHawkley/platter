import { hasValue } from 'common/monads';
import VectorLike from '../types/vector-like';
import RectLike from '../types/rect-like';
import Primative from '../geom/primative';
import { AABB } from '../geom/aabb';
import ProxyBase from './proxy-base';
import Node from '../space/node';
import { Kinematic } from '../space/kinematic';
import Matrix from '../math/matrix';
import Rect from '../math/rect';
import { set, setXY } from '../math/vector-math';
import { aabb as aabbSupport } from '../geom/support-functions';

const wm = new Matrix();
function translationIterator(anc: Node) {
  // Don't apply the world's translation.
  if (anc.parent) wm.translateXY(anc.x, anc.y);
}

class ProxyAABB extends ProxyBase<RectLike> {

  get width(): number { return this.geometry.width; }
  get height(): number { return this.geometry.height; }

  static create(owner: any, proxied: Primative, standIn: RectLike): ProxyAABB;
  static create(owner: any, proxied: AABB): ProxyAABB;
  static create(owner: any, proxied: Primative, standIn: RectLike = <AABB> proxied) {
    let instance = new ProxyAABB();
    return ProxyAABB.init(instance, owner, proxied, standIn);
  }

  static init(instance: ProxyAABB, owner: any, proxied: Primative, geometry: RectLike) {
    instance.owner = owner;
    instance.proxied = proxied;
    instance.geometry = geometry;

    let flipX = false, flipY = false, cp = instance.currentPos;
    let parent = proxied.parent;
    if (hasValue(parent))
      if (parent instanceof Kinematic)
        ({ flipX, flipY } = parent);
    let { x, y, width, height } = geometry;
    setXY(cp, flipX ? -x : x, flipY ? -y : y);
    wm.reset();
    proxied.iterateUpToRoot(translationIterator);
    wm.applyToPoint(cp);

    // The different signs are due to the "top-left to bottom-right"
    // arrangement that is popular in graphics/game libraries and that
    // this library also uses.
    if (flipX) cp.x -= width;
    if (flipY) cp.y += height;

    return instance;
  }

  static reclaim(instance: ProxyAABB) { return; }

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
    return aabbSupport(out, this, v);
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
    return setXY(out, this.x + this.width * 0.5, this.y + this.height * 0.5);
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
    return out.set(this);
  }

  toString() {
    let objRep = `{x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
    return `[object Platter.phys.ProxyAABB#${this.id}(${objRep})]`;
  }
}

export default ProxyAABB;