import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import Primative from './primative';
import CallbackType from '../callback/type';
import { Line as typeLine } from './types';
import { TypeMethod } from '../space/node';
import { TranslateMethod } from './primative';
import { ImmutableVector } from '../math/vector'
import { set, mul, add } from '../math/vector-math';
import { line as lineSupport } from './support-functions';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import RectLike from '../types/rect-like';
import ProxyLine from '../phys/proxy-line';
import CollisionFrame from '../phys/collision-frame';
import { getOrElse } from 'common/monads';

type DataLine = {
  x: number,
  y: number,
  type: CallbackType,
  rect: RectLike,
  pt1: ImmutableVector,
  pt2: ImmutableVector,
  normal: ImmutableVector,
  grade: number
}

const { PI, sqrt, min, abs } = Math;

/**
 * Represents a line, connecting two points.
 * 
 * @class Line
 * @extends {Primative}
 */
class Line extends Primative {

  /**
   * The first point of the line.
   * 
   * @readonly
   * @type {ImmutableVector}
   */
  get point1(): ImmutableVector { return this._immutData.pt1; }

  /**
   * The second point of the line.
   * 
   * @readonly
   * @type {ImmutableVector}
   */
  get point2(): ImmutableVector { return this._immutData.pt2; }

  /**
   * The left-hand normal of the line.
   * 
   * @readonly
   * @type {ImmutableVector}
   */
  get normal(): ImmutableVector { return this._immutData.normal; }

  /**
   * The grade of the line, assuming a character running on the line
   * left to right, AKA the Mario Standard Direction, or MSD.
   * 
   * @readonly
   * @type {number}
   */
  get grade(): number { return this._immutData.grade; }

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: DataLine;

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @param {CollisionFrame} owner
   * @returns {ProxyLine}
   */
  makeProxyFor(owner: CollisionFrame): ProxyLine {
    return ProxyLine.create(owner, this);
  }

  /**
   * Gets a support point for GJK collision calculations, using the given vector `v`,
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
    return out.set(this._immutData.rect);
  }

  /**
   * Returns a string representation of the line primative.
   * 
   * @returns {string}
   */
  toString(): string {
    let { point1: { x: x1, y: y1 }, point2: {x: x2, y: y2 } } = this;
    let pt1 = `{x: ${x1}, y: ${y1}}`, pt2 = `{x: ${x2}, y: ${y2}}`;
    return `[object Platter.geom.Line#${this.id}(${pt1}, ${pt2})]`;
  }
}

export const PointFromMethod = {
  name: 'from',
  apply() {
    let x: number, y: number;
    if (arguments.length === 1)
      ({x, y} = arguments[0]);
    else
      ([x, y] = arguments);
    this.pt1 = {x, y};
  }
}

export const PointToMethod = {
  name: 'to',
  apply() {
    let x: number, y: number;
    if (arguments.length === 1)
      ({x, y} = arguments[0]);
    else
      ([x, y] = arguments);
    this.pt2 = {x, y};
  }
}

export const PointsMethod = {
  name: 'points',
  apply() {
    let x1: number, y1: number, x2: number, y2: number;
    if (arguments.length === 2)
      ([{x: x1, y: y1}, {x: x2, y: y2}] = arguments);
    else
      ([x1, y1, x2, y2] = arguments);
    this.pt1 = { x: x1, y: y1 };
    this.pt2 = { x: x2, y: y2 };
  },
  seal() {
    let { x: offX, y: offY, pt1: { x: x1, y: y1 }, pt2: { x: x2, y: y2 } } = this;
    this.pt1 = ImmutableVector.create(x1 + offX, y1 + offY);
    this.pt2 = ImmutableVector.create(x2 + offX, y2 + offY);
    this.x = 0; this.y = 0;
  }
}

export const NormalMethod = {
  name: 'normal',
  finalize() {
    let { pt1: { x: x1, y: y1 }, pt2: { x: x2, y: y2 } } = this;
    let dx = x2 - x1, dy = -(y2 - y1), n: ImmutableVector;
    let len = sqrt(dy*dy + dx*dx);
    this.normal = n = ImmutableVector.create(dy / len, dx / len);
    let a = n.angle;
    if (a < 0) a += PI * 2;
    this.grade = (a + PI) * -1;
  }
}

export const RectangleMethod = {
  name: 'rectangle',
  finalize() {
    let { x: offX, y: offY, pt1: { x: x1, y: y1 }, pt2: { x: x2, y: y2 } } = this;
    x1 += offX; y1 += offY;
    x2 += offX; y2 += offY;
    this.rect = {
      x: min(x1, x2),
      y: min(y1, y2),
      width: abs(x1 - x2),
      height: abs(y1 - y2)
    }
  },
  seal() { Object.freeze(this.rect); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() { this.type.push(typeLine); }
}

const Methods = compileMethods([
  PointFromMethod, PointToMethod, PointsMethod,
  NormalMethod, RectangleMethod, SetTypeMethod
]);

@InstallMethod(NormalMethod)
@InstallMethod(RectangleMethod)
@InstallMethod(SetTypeMethod)
class LineGenerator extends Generator<Line> {
  
  /**
   * Adds the given type to the generated object.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Translates the line by the given `x` and `y` offset, cumulative.
   * 
   * @param {number} x The `x` coordinate.
   * @param {number} y The `y` coordinate.
   * @returns {this}
   */
  @ApplyMethod(TranslateMethod)
  translate: (x: number, y: number) => this;

  /**
   * Provides the first point of the line.
   * 
   * Overloaded to accept either a `VectorLike` object or an `x` and `y`
   * coordinate pair.
   * 
   * @type {{ (v: VectorLike): void; (x: number, y: number): void; }}
   */
  @ApplyMethod(PointToMethod)
  to: {
    (v: VectorLike): void;
    (x: number, y: number): void;
  };

  /**
   * Provides the second point of the line.
   * 
   * Overloaded to accept either a `VectorLike` object or an `x` and `y`
   * coordinate pair.
   * 
   * @type {{ (v: VectorLike): void; (x: number, y: number): void; }}
   */
  @ApplyMethod(PointFromMethod)
  from: {
    (v: VectorLike): void;
    (x: number, y: number): void;
  };

  /**
   * Provides both the start and end points of the line.
   * 
   * Overloaded to accept either two `VectorLike` objects or two `x` and `y`
   * coordinate pairs.
   * 
   * @type {{
   *     (v1: VectorLike, v2: VectorLike): void;
   *     (x1: number, y1: number, x2: number, y2: number): void;
   *   }}
   */
  @ApplyMethod(PointsMethod)
  points: {
    (v1: VectorLike, v2: VectorLike): void;
    (x1: number, y1: number, x2: number, y2: number): void;
  };

  /**
   * Creates a new `Line` instance.
   * 
   * @returns {Line}
   */
  create(): Line { return super.create(); };

  protected _createInstance(): Line { return new Line(); }

  protected _initializeInstance(o: Line): Line { return o; }
}

const LineFactory = Factory.for(LineGenerator);

export { Line, LineFactory, Methods, typeLine as Type };
export default LineFactory;