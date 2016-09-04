import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import Primative from './primative';
import CallbackType from '../callback/type';
import { AABB as typeAABB } from './types';
import { TypeMethod } from '../space/node';
import { TranslateMethod } from './primative';
import { setXY } from '../math/vector-math';
import { aabb as aabbSupport } from './support-functions';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import ProxyAABB from '../phys/proxy-aabb';
import { hasValue, getOrElse } from 'common/monads';

type DataABBB = {
  x: number,
  y: number,
  width: number,
  height: number,
  type: CallbackType
}

/**
 * Represents an axis-aligned bounding box.
 * 
 * @class AABB
 * @extends {Primative}
 */
class AABB extends Primative {

  get width(): number { return this._immutData.width; }

  get height(): number { return this._immutData.height; }

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: DataABBB;

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @param {*} owner
   * @returns {ProxyAABB}
   */
  makeProxyFor(owner: any): ProxyAABB {
    return ProxyAABB.create(owner, this);
  }

  support<T extends VectorLike>(out: T, v: VectorLike): T {
    return aabbSupport(out, this, v);
  }

  centerOf<T extends VectorLike>(out: T): T {
    return setXY(out, this.x + this.width * 0.5, this.y + this.height * 0.5);
  }

  toRect<T extends Rect>(out: T): T {
    return out.set(this._immutData);
  }

  toString(): string {
    let objRep = `{x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
    return `[object Platter.geom.AABB#${this.id}(${objRep})]`;
  }
}

export const DimensionsMethod = {
  name: 'dimensions',
  apply(width: number, height: number) { this.width = width; this.height = height; },
  finalize() {
    if (!(hasValue(this.width) && hasValue(this.height)) || this.width <= 0 || this.height <= 0)
      throw new Error('both dimensions must be provided');
  }
}

export const WidthMethod = {
  name: 'width',
  apply(width: number) { this.width = width; }
}

export const HeightMethod = {
  name: 'height',
  apply(height: number) { this.height = height; }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() { this.type.push(typeAABB); }
}

const Methods = compileMethods([DimensionsMethod, WidthMethod, HeightMethod, SetTypeMethod]);

@InstallMethod(SetTypeMethod)
class AABBGenerator extends Generator<AABB> {
  
  /**
   * Adds the given type to the generated object.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Translates the box by the given `x` and `y` offset, cumulative.
   * 
   * @param {number} x The `x` coordinate.
   * @param {number} y The `y` coordinate.
   * @returns {this}
   */
  @ApplyMethod(TranslateMethod)
  translate: (x: number, y: number) => this;

  /**
   * Sets the dimensions of the box.
   * 
   * @param {number} width The width of the box.
   * @param {number} height The height of the box.
   * @returns {this}
   */
  @ApplyMethod(DimensionsMethod)
  dimensions: (width: number, height: number) => this;

  /**
   * Sets the width of the box.
   * 
   * @param {number} width The width of the box.
   * @returns {this}
   */
  @ApplyMethod(WidthMethod)
  width: (width: number) => this;

  /**
   * Sets the height of the box.
   * 
   * @param {number} height The height of the box.
   * @returns {this}
   */
  @ApplyMethod(HeightMethod)
  height: (height: number) => this;

  /**
   * Creates a new `AABB` instance.
   * 
   * @returns {AABB}
   */
  create(): AABB { return super.create(); };

  protected _createInstance(): AABB { return new AABB(); }

  protected _initializeInstance(o: AABB): AABB { return o; }
}

const AABBFactory = Factory.for(AABBGenerator);

export { AABB, AABBFactory, Methods, typeAABB as Type };
export default AABBFactory;