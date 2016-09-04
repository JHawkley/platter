import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import { Line } from './line';
import { Chain } from './chain';
import CallbackType from '../callback/type';
import { ChainLink as typeChainLink } from './types';
import { TypeMethod } from '../space/node';
import { TranslateMethod } from './primative';
import { PointFromMethod, PointToMethod, PointsMethod } from './line';
import { NormalMethod, RectangleMethod, SetTypeMethod as LineSetTypeMethod } from './line';
import { Group } from '../space/group';
import VectorLike from '../types/vector-like';
import RectLike from '../types/rect-like';
import ProxyChainLink from '../phys/proxy-chain-link';
import { Maybe, hasValue, getOrElse } from 'common/monads';

type InstanceDataChainLink = {
  host: Chain;
}

/**
 * Represents a link in a chain, a line whose start and end may be
 * the start and end of other links in a chain of lines.
 * 
 * @class ChainLink
 * @extends {Line}
 */
class ChainLink extends Line {

  /**
   * Obtains the hosting `Chain` instance for this link.
   * 
   * @readonly
   * @type {Chain}
   */
  get host(): Chain { return this._instanceData.host; }

  /**
   * Obtains the chain-link that preceeds this link in the chain,
   * if such a link exists.
   * 
   * @readonly
   * @type {Maybe<ChainLink>}
   */
  get prev(): Maybe<ChainLink> { return this._instanceData.host.getPrev(this); }

  /**
   * Obtains the chain-link that follows this link in the chain,
   * if such a link exists.
   * 
   * @readonly
   * @type {Maybe<ChainLink>}
   */
  get next(): Maybe<ChainLink> { return this._instanceData.host.getNext(this); }

  private _instanceData: InstanceDataChainLink;

  /**
   * Initializes the chain-link.
   * 
   * @static
   * @param {ChainLink} instance The `ChainLink` instance to initialize.
   * @param {Chain} host The `Chain` instance that will contain this link.
   * @returns {ChainLink}
   */
  static init(instance: ChainLink, host: Chain): ChainLink {
    if (!hasValue(host))
      throw new Error('a chain-link requires a chain to host it');
    instance._instanceData = { host };
    Object.freeze(instance._instanceData);
    return instance;
  }

  /**
   * Destroys thie `ChainLink` instance.
   */
  destroy() {
    super.destroy();
    this._instanceData = null as any;
  }

  /**
   * Creates a proxy object, setting the given collision frame as the proxy's owner.
   * 
   * @param {*} owner
   * @returns {ProxyChainLink}
   */
  makeProxyFor(owner: any): ProxyChainLink {
    return ProxyChainLink.create(owner, this);
  }

  /**
   * Throws an error; a chain-link is part of a larger primative, the hosting `Chain`.
   * The chain-link is only in-world if its chain is.
   * 
   * @param {Group} group The group that adopted this node.
   */
  wasAdoptedBy(group: Group) {
    throw new Error('must be hosted by a chain to be in the world tree');
  }

  /**
   * Returns a string representation of the chain-link primative.
   * 
   * @returns {string}
   */
  toString(): string {
    let pt1 = `{x: ${this.point1.x}, y: ${this.point1.y}}`;
    let pt2 = `{x: ${this.point2.x}, y: ${this.point2.y}}`;
    return `[object Platter.geom.ChainLink#${this.id}(${pt1}, ${pt2})]`;
  }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() {
    LineSetTypeMethod.finalize.call(this);
    this.type.push(typeChainLink);
  }
}

const Methods = compileMethods([SetTypeMethod]);

interface DefinePoint<T> {
  (v: VectorLike): T;
  (x: number, y: number): T;
}

interface DefinePoints<T> {
  (v1: VectorLike, v2: VectorLike): T;
  (x1: number, y1: number, x2: number, y2: number): T;
}

@InstallMethod(NormalMethod)
@InstallMethod(RectangleMethod)
@InstallMethod(SetTypeMethod)
class ChainLinkGenerator extends Generator<ChainLink> {
  
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
   * @type {{ (v: VectorLike): this; (x: number, y: number): this; }}
   */
  @ApplyMethod(PointToMethod)
  to: DefinePoint<this>;

  /**
   * Provides the second point of the line.
   * 
   * Overloaded to accept either a `VectorLike` object or an `x` and `y`
   * coordinate pair.
   * 
   * @type {{ (v: VectorLike): this; (x: number, y: number): this; }}
   */
  @ApplyMethod(PointFromMethod)
  from: DefinePoint<this>;

  /**
   * Provides both the start and end points of the line.
   * 
   * Overloaded to accept either two `VectorLike` objects or two `x` and `y`
   * coordinate pairs.
   * 
   * @type {{ (v1: VectorLike, v2: VectorLike): this; (x1: number, y1: number, x2: number, y2: number): this; }}
   */
  @ApplyMethod(PointsMethod)
  points: DefinePoints<this>;
  
  /**
   * Creates a new `ChainLink` instance.
   * 
   * @param {Chain} host
   * @returns {ChainLink}
   */
  create(host: Chain): ChainLink { return super.create(host); };

  protected _createInstance(): ChainLink { return new ChainLink(); }

  protected _initializeInstance(o: ChainLink, host: Chain): ChainLink {
    return ChainLink.init(o, host);
  }
}

const ChainLinkFactory = Factory.for(ChainLinkGenerator);

export { ChainLink, ChainLinkFactory, Methods, typeChainLink as Type };
export default ChainLinkFactory;