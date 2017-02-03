import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import Primative from './primative';
import CallbackType from '../callback/type';
import { Circle as typeCircle } from './types';
import { TypeMethod } from '../space/node';
import { TranslateMethod } from './primative';
import { set } from '../math/vector-math';
import { circle as circleSupport } from './support-functions';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import RectLike from '../types/rect-like';
import ProxyCircle from '../phys/proxy-circle';
import CollisionFrame from '../phys/collision-frame';
import { hasValue, getOrElse } from 'common/monads';

type DataCircle = {
  x: number,
  y: number,
  radius: number,
  type: CallbackType,
  rect: RectLike
}

/**
 * Represents a basic circle.
 * 
 * @class Circle
 * @extends {Primative}
 */
class Circle extends Primative {

  /**
   * The radius of the circle.
   * 
   * @readonly
   * @type {number}
   */
  get radius(): number { return this._immutData.radius; }

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: DataCircle;

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @param {CollisionFrame} owner
   * @returns {ProxyCircle}
   */
  makeProxyFor(owner: CollisionFrame): ProxyCircle {
    return ProxyCircle.create(owner, this);
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
   * Returns a string representation of the circle primative.
   * 
   * @returns {string}
   */
  toString(): string {
    let { id, x, y, radius } = this;
    return `[object Platter.geom.Circle#${id}({x: ${x}, y: ${y}}, radius: ${radius})]`;
  }
}

export const RadiusMethod = {
  name: 'radius',
  apply(r: number) { this.radius = r; }
}

export const RectangleMethod = {
  name: 'rectangle',
  finalize() {
    let r = this.radius;
    if (!hasValue(r))
      throw new Error('no radius provided');
    let d = r + r;
    this.rect = { x: this.x - r, y: this.y - r, width: d, height: d };
  },
  seal() { Object.freeze(this.rect); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() { this.type.push(typeCircle); }
}

const Methods = compileMethods([RadiusMethod, RectangleMethod, SetTypeMethod]);

@InstallMethod(RectangleMethod)
@InstallMethod(SetTypeMethod)
class CircleGenerator extends Generator<Circle> {
  
  /**
   * Adds the given type to the generated object.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Translates the circle by the given `x` and `y` offset, cumulative.
   * 
   * @param {number} x The `x` coordinate.
   * @param {number} y The `y` coordinate.
   * @returns {this}
   */
  @ApplyMethod(TranslateMethod)
  translate: (x: number, y: number) => this;

  /**
   * Sets the circle's radius.
   * 
   * @param {number} r The radius to assign.
   * @returns {this}
   */
  @ApplyMethod(RadiusMethod)
  radius: (r: number) => this;

  /**
   * Creates a new `Circle` instance.
   * 
   * @returns {Circle}
   */
  create(): Circle { return super.create(); };

  protected _createInstance(): Circle { return new Circle(); }

  protected _initializeInstance(o: Circle): Circle { return o; }
}

const CircleFactory = Factory.for(CircleGenerator);

export { Circle, CircleFactory, Methods, typeCircle as Type };
export default CircleFactory;