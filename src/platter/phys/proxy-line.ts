import { hasValue } from 'common/monads';
import VectorLike from '../types/vector-like';
import LineLike from '../types/line-like';
import Primative from '../geom/primative';
import { Line } from '../geom/line';
import ProxyBase from './proxy-base';
import Node from '../space/node';
import { Kinematic } from '../space/kinematic';
import Matrix from '../math/matrix';
import Rect from '../math/rect';
import { MutableVector, BaseVector } from '../math/vector';
import { set, setXY, add, mul } from '../math/vector-math';
import { line as lineSupport } from '../geom/support-functions';

const { PI, sqrt, min, abs } = Math;
const wm = new Matrix();
function translationIterator(anc: Node) {
  // Don't apply the world's translation.
  if (anc.parent) wm.translateXY(anc.x, anc.y);
}

class ProxyLine extends ProxyBase<LineLike> {

  point1: BaseVector;
  point2: BaseVector;
  normal: BaseVector;
  grade: number;

  static create(owner: any, proxied: Primative, standIn: LineLike): ProxyLine;
  static create(owner: any, proxied: Line): ProxyLine;
  static create(owner: any, proxied: Primative, standIn: LineLike = <Line> proxied) {
    let instance = new ProxyLine();
    return ProxyLine.init(instance, owner, proxied, standIn);
  }

  static init(instance: ProxyLine, owner: any, proxied: Primative, geometry: LineLike): ProxyLine {
    instance.owner = owner;
    instance.proxied = proxied;
    instance.geometry = geometry;

    let flipX = false, flipY = false;
    let { currentPos: cp, point1: p1, point2: p2 } = instance;
    let parent = proxied.parent;
    let { point1, point2 } = geometry;
    if (hasValue(parent))
      if (parent instanceof Kinematic)
        ({ flipX, flipY } = parent);
    
    let { point1: { x: x1, y: y1 } , point2: { x: x2, y: y2 } } = geometry;

    // We may need to flip the verts to maintain the expected surface normals.
    if (flipX === flipY) {
      setXY(p1, flipX ? -x1 : x1, flipY ? -y1 : y1);
      setXY(p2, flipX ? -x2 : x2, flipY ? -y2 : y2);
    } else {
      setXY(p2, flipX ? -x1 : x1, flipY ? -y1 : y1);
      setXY(p1, flipX ? -x2 : x2, flipY ? -y2 : y2);
    }
    wm.reset();
    proxied.iterateUpToRoot(translationIterator);
    wm.applyToPoint(p1);
    wm.applyToPoint(p2);
    setXY(cp, 0, 0);

    //And now the normal + grade.
    ({ x: x1, y: y1} = p1); ({ x: x2, y: y2} = p2);
    let dx = x2 - x1, dy = -(y2 - y1), n = instance.normal;
    let len = sqrt(dy*dy + dx*dx);
    setXY(n, dy / len, dx / len);
    let a = n.angle;
    if (a < 0) a += PI * 2;
    instance.grade = (a + PI) * -1;

    return instance;
  }

  static reclaim(instance: ProxyLine) { return; }

  constructor() {
    super();
    this.point1 = MutableVector.create();
    this.point2 = MutableVector.create();
    this.normal = MutableVector.create();
    this.grade = 0;
  }

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
    return lineSupport(out, this, v);
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
    set(out, this.point1);
    add(out, out, this.point2);
    return mul(out, out, 0.5);
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
    let { point1: { x: x1, y: y1 }, point2: { x: x2, y: y2 } } = this;
    out.setProps(min(x1, x2), min(y1, y2), abs(x1 - x2), abs(y1 - y2));
    return out;
  }

  toString(): string {
    let { point1: { x: x1, y: y1 }, point2: {x: x2, y: y2 } } = this;
    let pt1 = `{x: ${x1}, y: ${y1}}`, pt2 = `{x: ${x2}, y: ${y2}}`;
    return `[object Platter.phys.ProxyLine#${this.id}(${pt1}, ${pt2})]`;
  }
}

export default ProxyLine;