import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import Primative from './primative';
import CallbackType from '../callback/type';
import { Point as typePoint } from './types';
import { TypeMethod } from '../space/node';
import { TranslateMethod } from './primative';
import { set } from '../math/vector-math';
import { point as pointSupport } from './support-functions';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import RectLike from '../types/rect-like';
import ProxyPoint from '../phys/proxy-point';
import { getOrElse } from 'common/monads';

type DataPoint = {
  x: number,
  y: number,
  type: CallbackType,
  rect: RectLike
}

/**
 * Represents a single point in space.
 * 
 * @class Point
 * @extends {Primative}
 */
class Point extends Primative {

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: DataPoint;

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @param {*} owner
   * @returns {ProxyPoint}
   */
  makeProxyFor(owner: any): ProxyPoint {
    return ProxyPoint.create(owner, this);
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
    return pointSupport(out, this, v);
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
    return set(out, this);
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
   * Returns a string representation of the point primative.
   * 
   * @returns {string}
   */
  toString(): string {
    return `[object Platter.geom.Point#${this.id}({x: ${this.x}, y: ${this.y}})]`;
  }
}

export const RectangleMethod = {
  name: 'rectangle',
  finalize() { this.rect = { x: this.x, y: this.y, width: 0, height: 0 }; },
  seal() { Object.freeze(this.rect); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() { this.type.push(typePoint); }
}

const Methods = compileMethods([RectangleMethod, SetTypeMethod]);

@InstallMethod(RectangleMethod)
@InstallMethod(SetTypeMethod)
class PointGenerator extends Generator<Point> {
  
  /**
   * Adds the given type to the generated object.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Translates the point by the given `x` and `y` offset, cumulative.
   * 
   * @param {number} x The `x` coordinate.
   * @param {number} y The `y` coordinate.
   * @returns {this}
   */
  @ApplyMethod(TranslateMethod)
  translate: (x: number, y: number) => this;

  /**
   * Creates a new `Point` instance.
   * 
   * @returns {Point}
   */
  create(): Point { return super.create(); };

  protected _createInstance(): Point { return new Point(); }

  protected _initializeInstance(o: Point): Point { return o; }
}

const PointFactory = Factory.for(PointGenerator);

export { Point, PointFactory, Methods, typePoint as Type };
export default PointFactory;