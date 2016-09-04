import Node from '../space/node';
import CallbackType from '../callback/type';
import Rect from '../math/rect';
import ProxyBase from '../phys/proxy-base';
import VectorLike from '../types/vector-like';
import compileMethods from '../factory/compile-methods';
import { getOrElse } from 'common/monads';

type DataPrimative = {
  x: number,
  y: number,
  type: CallbackType
}

/**
 * The base class for all primative shapes.
 * 
 * @abstract
 * @class Primative
 * @extends {Node}
 */
abstract class Primative extends Node {

  /**
   * The `x` component of the primative's position, offset to its parent.
   * 
   * @readonly
   * @type {number}
   */
  get x(): number { return getOrElse(this._immutData.x, 0); }

  /**
   * The `y` component of the primative's position, offset to its parent.
   * 
   * @readonly
   * @type {number}
   */
  get y(): number { return getOrElse(this._immutData.y, 0); }

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: DataPrimative;

  /**
   * Creates an instance of `Primative`.
   */
  constructor() {
    super();
  }

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @abstract
   * @param {*} owner
   * @returns {ProxyBase<any>}
   */
  abstract makeProxyFor(owner: any): ProxyBase<any>;

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
   * Returns a string representation of the primative.
   * 
   * @returns {string}
   */
  toString(): string {
    return `[object Platter.geom.Primative#${this.id}({x: ${this.x}, y: ${this.y}})]`;
  }
}

export const TranslateMethod = {
  name: 'translate',
  init() { this.x = 0; this.y = 0; },
  apply(x: number, y: number) { this.x += x; this.y += y; }
}

const Methods = compileMethods([TranslateMethod]);

export { Primative, Methods };
export default Primative;