import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import Primative from './primative';
import { ChainLink, ChainLinkFactory } from './chain-link';
import CallbackType from '../callback/type';
import { Chain as typeChain } from './types';
import { TypeMethod as NodeTypeMethod } from '../space/node';
import { TranslateMethod } from './primative';
import { setXY, equals } from '../math/vector-math';
import VectorLike from '../types/vector-like';
import Rect from '../math/rect';
import RectLike from '../types/rect-like';
import { isArray, removeAt } from '../utils/array';
import { Maybe, hasValue } from 'common/monads';

type ImmutableDataChain = {
  x: number,
  y: number,
  type: CallbackType,
  rect: RectLike,
  links: Array<Generator<ChainLink>>,
  closed: boolean,
  reversed: boolean;
}

type InstanceDataChain = {
  links: Array<ChainLink>,
  prevHash: { [id: number]: ChainLink },
  nextHash: { [id: number]: ChainLink }
}

const { min, max } = Math;

/**
 * Represents group of continuous line-segments, where one line begins
 * where another ends.  One link of the chain can look up the next
 * or previous link, making it easy to have objects that may be moving
 * across the chain's surface react to uneven surface changes without
 * relying on multiple collision responses.
 * 
 * @class Chain
 * @extends {Primative}
 */
class Chain extends Primative {

  /**
   * The `x` component of the top-left extent of the chain's bounding box,
   * offset to its parent.
   * 
   * @readonly
   * @type {number}
   */
  get x(): number { return this._immutData.rect.x; }

  /**
   * The `y` component of the top-left extent of the chain's bounding box,
   * offset to its parent.
   * 
   * @readonly
   * @type {number}
   */
  get y(): number { return this._immutData.rect.y; }

  /**
   * The collection `ChainLink` objects that belong to this chain.
   * 
   * @readonly
   * @type {Array<ChainLink>}
   */
  get links(): Array<ChainLink> { return this._instanceData.links; }

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: ImmutableDataChain;

  private _instanceData: InstanceDataChain;

  /**
   * Initializes the chain, creating and organizing the child chain-links.
   * 
   * @static
   * @param {Chain} instance The `Chain` instance to initialize.
   * @returns {Chain}
   */
  static init(instance: Chain): Chain {
    let nextHash: { [id: number]: ChainLink } = {};
    let prevHash: { [id: number]: ChainLink } = {};
    let links: Array<ChainLink> = [];
    let prevLink: Maybe<ChainLink> = null;
    let curLink: Maybe<ChainLink> = null;

    for (let i = 0, len = instance._immutData.links.length; i < len; i++) {
      curLink = instance._immutData.links[i].create(instance);
      if (hasValue(prevLink)) {
        prevHash[curLink.id] = prevLink;
        nextHash[prevLink.id] = curLink;
      }
      links.push(curLink);
      prevLink = curLink;
    }

    if (instance._immutData.closed) {
      if (!hasValue(curLink))
        throw new Error('no links were provided to close');
      let firstLink = links[0];
      prevHash[firstLink.id] = curLink;
      nextHash[curLink.id] = firstLink;
    }

    Object.freeze(prevHash);
    Object.freeze(nextHash);
    Object.freeze(links);
    
    let instanceData = { links, prevHash, nextHash };
    Object.freeze(instanceData);

    instance._instanceData = instanceData;
    return instance;
  }

  /**
   * Destroys this `Chain` instance, as well as releasing all chain-links
   * that belong to it.
   */
  destroy() {
    super.destroy();
    let links = this._instanceData.links;
    for (let i = 0, len = links.length; i < len; i++)
      links[i].release();
    this._instanceData = null as any;
  }

  /**
   * Obtains an iterator that will visit each `ChainLink` object the chain contains.
   * 
   * @returns {Iterator<ChainLink>}
   */
  [Symbol.iterator](): Iterator<ChainLink> {
    let nextIndex = 0;
    let links = this.links;
    let result: IteratorResult<ChainLink> = { value: null as any, done: false };
    return {
      next: () => {
        switch (nextIndex) {
          case links.length:
            result.value = null as any;
            result.done = true;
            break;
          default:
            result.value = links[nextIndex++];
            result.done = false;
            break;
        }
        return result;
      }
    }
  }

  /**
   * Gets the chain-link that follows the given link.
   * 
   * @param {ChainLink} ref The `ChainLink` reference to search after.
   * @returns {Maybe<ChainLink>}
   */
  getNext(ref: ChainLink): Maybe<ChainLink> { return this._instanceData.nextHash[ref.id]; }

  /**
   * Gets the chain-link that preceeds the given link.
   * 
   * @param {ChainLink} ref The `ChainLink` reference to search before.
   * @returns {Maybe<ChainLink>}
   */
  getPrev(ref: ChainLink): Maybe<ChainLink> { return this._instanceData.prevHash[ref.id]; }

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @param {never} owner
   * @returns {ProxyAABB}
   */
  makeProxyFor(owner: never): never {
    throw new Error('cannot make a proxy for chains; create proxies for its individual chain-links instead');
  }

  /**
   * Throws an error; even if this chain is a closed polygon, the lines that make it up
   * may describe a convex shape, which the GJK algorithm does not support.  Instead,
   * take the chain piecewise, one link at a time.
   * 
   * @template T
   * @param {T} out The vector to which the result will be set.
   * @param {VectorLike} v The vector direction of the support point to locate.
   * @returns {T}
   */
  support<T extends VectorLike>(out: T, v: VectorLike): T {
    throw new Error('not supported; use individual chain-link support function instead');
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
    let rect = this._immutData.rect;
    let x = rect.x + (rect.width * 0.5);
    let y = rect.y + (rect.height * 0.5);
    return setXY(out, x, y);
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
   * Returns a string representation of the chain primative.
   * 
   * @returns {string}
   */
  toString(): string {
    return `[object Platter.geom.Chain#${this.id}({links.length: ${this.links.length}})]`;
  }
}

export const PointsMethod = {
  name: 'points',
  init() { this.points = []; },
  apply() {
    if (this.closed)
      throw new Error('cannot add points to a closed shape');
    let newPoints = isArray(arguments[0]) ? <Array<VectorLike>> arguments[0] : arguments;
    for (let i = 0, len = newPoints.length; i < len; i++)
      this.points.push(newPoints[i]);
  },
  finalize() {
    // Remove duplicate points.
    let points: Array<VectorLike> = this.points;
    let lastPoint: Maybe<VectorLike> = null;
    let i = 0;
    while (i < points.length) {
      let curPoint: VectorLike = points[i];
      if (equals(lastPoint, curPoint))
        removeAt(points, i);
      else
        i += 1;
      lastPoint = curPoint;
    }
    if (points.length <= 1)
      throw new Error('not enough points to create a single chain');
    if (this.closed && points.length <= 3)
      throw new Error('not a closed polygon; more a line or point');
  },
  seal() {
    for (let i = 0, len = this.points.length; i < len; i++)
      Object.freeze(this.points[i]);
    Object.freeze(this.points);
  }
}

export const AddPointMethod = {
  name: 'add',
  apply() {
    if (this.closed)
      throw new Error('cannot add points to a closed shape');
    let x: number, y: number;
    switch (arguments.length) {
      case 1:
        ({x, y} = arguments[0]);
        break;
      case 2:
        ([x, y] = arguments);
        break;
      default:
        throw new Error('bad arguments');
    }
    this.points.push({x, y});
  }
}

export const CloseMethod = {
  name: 'close',
  init() { this.closed = false; },
  apply() {
    if (this.closed)
      throw new Error('already closed the shape');
    let points: Array<VectorLike> = this.points;
    let firstPoint = points[0], lastPoint = points[points.length - 1];
    if (equals(firstPoint, lastPoint)) {
      if (points.length <= 3)
        throw new Error('not a closed polygon; more a line or point');
    } else {
      if (points.length <= 2)
        throw new Error('not enough points to create a closed polygon');
      points.push(firstPoint);
    }
    this.closed = true;
  },
  finalize() {
    if (this.closed) return;
    let points: Array<VectorLike> = this.points;
    let firstPoint = points[0], lastPoint = points[points.length - 1];
    if (equals(firstPoint, lastPoint)) {
      if (points.length <= 3)
        throw new Error('not a closed polygon; more a line or point');
      this.closed = true;
    }
  }
}

export const ReverseMethod = {
  name: 'reverse',
  init() { this.reversed = false; },
  apply() { this.reversed = true; }
}

export const LinksMethod = {
  name: 'links',
  init() { this.links = []; },
  seal() {
    let { x: xOff, y: yOff } = this;
    let links: Array<Generator<ChainLink>> = this.links;
    let points: Array<VectorLike> = this.points;
    let lastPoint: Maybe<VectorLike> = null;
    let dir = this.reversed ? -1 : 1;
    for (let len = points.length, i = (dir > 0 ? 0 : len - 1); (dir > 0 ? i < len : i >= 0); i += dir) {
      let curPoint = points[i];
      if (hasValue(lastPoint)) {
        let generator = ChainLinkFactory.define()
          .translate(xOff, yOff)
          .points(lastPoint, curPoint)
          .type(this.chainType)
          .seal();
        links.push(generator);
      }
      lastPoint = curPoint;
    }
    delete this.chainType;
    Object.freeze(links);
  }
}

export const RectangleMethod = {
  name: 'rectangle',
  finalize() {
    let top: number, left: number;
    top = left = Number.POSITIVE_INFINITY;
    let bottom: number, right: number;
    bottom = right = Number.NEGATIVE_INFINITY;
    let points: Array<VectorLike> = this.points;
    for (let i = 0, len = points.length; i < len; i++) {
      let {x, y} = points[i];
      top = min(top, y);
      left = min(left, x);
      bottom = max(bottom, y);
      right = max(right, x);
    }
    this.rect = {
      x: left + this.x,
      y: top + this.y,
      width: right - left,
      height: bottom - top
    };
  },
  seal() { Object.freeze(this.rect); }
}

export const TypeMethod = {
  name: 'type',
  init() {
    NodeTypeMethod.init.call(this);
    this.chainType = [];
  },
  apply(cbType: CallbackType | Array<CallbackType>) {
    NodeTypeMethod.apply.call(this, cbType);
    if (isArray(cbType))
      this.chainType.push(...cbType);
    else
      this.chainType.push(cbType);
  },
  seal() { NodeTypeMethod.seal.call(this); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() { this.type.push(typeChain); }
}

const Methods = compileMethods([
  PointsMethod, AddPointMethod, CloseMethod, ReverseMethod,
  LinksMethod, RectangleMethod, TypeMethod, SetTypeMethod
]);

interface DefinePoint<T> {
  (v: VectorLike): T;
  (x: number, y: number): T;
}

interface DefinePoints<T> {
  (...points: Array<VectorLike>): T;
  (points: Array<VectorLike>): T;
}

@InstallMethod(LinksMethod)
@InstallMethod(RectangleMethod)
@InstallMethod(SetTypeMethod)
class ChainGenerator extends Generator<Chain> {

  /**
   * Adds the given type to the generated `Chain` and its `ChainLink` children.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Translates the chain and its links by the given `x` and `y` offset, cumulative.
   * 
   * @param {number} x The `x` coordinate.
   * @param {number} y The `y` coordinate.
   * @returns {this}
   */
  @ApplyMethod(TranslateMethod)
  translate: (x: number, y: number) => this;

  /**
   * Adds the given points to the chain.
   * 
   * Overloaded to accept either several `VectorLike` objects as arguments or a single
   * array of `VectorLike` objects.
   * 
   * @type {{ (...points: Array<VectorLike>): this; (points: Array<VectorLike>): this; }}
   */
  @ApplyMethod(PointsMethod)
  points: DefinePoints<this>;

  /**
   * Adds a single point to the chain.
   * 
   * Overloaded to accept either a `VectorLike` object or an `x` and `y`
   * coordinate pair.
   * 
   * @type {{ (v: VectorLike): this; (x: number, y: number): this; }}
   */
  @ApplyMethod(AddPointMethod)
  add: DefinePoint<this>;

  /**
   * Closes the chain, turning it into a closed polygon.  This will automatically
   * create a duplicate of the first point if it is needed to close the polygon.
   * No points can be added after the polygon has been closed.
   * 
   * @returns {this}
   */
  @ApplyMethod(CloseMethod)
  close: () => this;

  /**
   * Puts the chain into 'reverse mode', reversing the winding of the points.
   * Helpful if your level editor exports them in clock-wise order.
   * 
   * @returns {this}
   */
  @ApplyMethod(ReverseMethod)
  reverse: () => this;

  /**
   * Creates a new `Chain` instance.
   * 
   * @returns {Chain}
   */
  create(): Chain { return super.create(); }

  protected _createInstance(): Chain { return new Chain(); }

  protected _initializeInstance(o: Chain): Chain {
    return Chain.init(o);
  }
}

const ChainFactory = Factory.for(ChainGenerator);

export { Chain, ChainFactory, Methods, typeChain as Type };
export default ChainFactory;