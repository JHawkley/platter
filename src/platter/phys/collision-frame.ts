import { Maybe, hasValue, getOrElse } from 'common/monads';
import ProxyBase from './proxy-base';
import TOIIsland from './toi-island';
import Primative from '../geom/primative';
import { MutableVector, zeroVector } from '../math/vector';

import { AABB } from '../geom/aabb';
import ProxyAABB from './proxy-aabb';
import RectLike from '../types/rect-like';

import { Circle } from '../geom/circle';
import ProxyCircle from './proxy-circle';
import CircleLike from '../types/circle-like';

import { Line } from '../geom/line';
import ProxyLine from './proxy-line';
import LineLike from '../types/line-like';

import { Point } from '../geom/point';
import ProxyPoint from './proxy-point';
import VectorLike from '../types/vector-like';

import { ChainLink } from '../geom/chain-link';
import ProxyChainLink from './proxy-chain-link';

interface IOwnable { release(): void };
type CollisionMap<T> = { [aId: number]: { [bId: number]: Maybe<T> }};

function setMap<T>(a: number, b: number, val: Maybe<T>, map: CollisionMap<T>) {
  if (!map[a]) map[a] = {};
  if (!map[b]) map[b] = {};
  map[a][b] = map[b][a] = val;
}

function getMap<T>(a: number, b: number, map: CollisionMap<T>): Maybe<T> {
  let s: any; return (s = map[a]) ? s[b] : undefined;
}

class CollisionFrame {

  private _ownedObjs: Array<IOwnable>;

  private _primatives: Array<Primative>;
  private _primativesByID: { [id: number]: Maybe<Primative> };
  private _lastPrimID: Maybe<number>;

  private _simpleProxies: { [id: number]: Maybe<ProxyBase<any>> }

  private _deltas: { [id: number]: Maybe<MutableVector> };

  private _islands: TOIIsland;
  private _primToIslands: { [id: number]: Maybe<TOIIsland> };

  private _collisions: Array<null>;
  private _collisionsMap: CollisionMap<null>;

  private _started: boolean;

  // TODO: Handle chains.
  addPrimative(primative: Primative): this {
    if (this._started)
      throw new Error('cannot add a primative; frame was started');
    let id = primative.id;
    if (!this._primativesByID[id]) {
      this._primatives.push(primative);
      this._primativesByID[id] = primative;
    }
    this._lastPrimID = id;
    return this;
  }

  assumeDelta(delta: VectorLike): this {
    if (this._started)
      throw new Error('cannot assume a position delta; frame was started');
    if (!hasValue(this._lastPrimID))
      throw new Error('cannot assume a position delta; context has no primative');
    this.getDeltaFor(this._lastPrimID).set(delta);
    return this;
  }

  getProxyFor(prim: AABB): ProxyAABB;
  getProxyFor(prim: ChainLink): ProxyChainLink;
  getProxyFor(prim: Circle): ProxyCircle;
  getProxyFor(prim: Line): ProxyLine;
  getProxyFor(prim: Point): ProxyPoint;
  getProxyFor<T>(id: number): ProxyBase<T>;
  getProxyFor<T>(prim: Primative | number): ProxyBase<T> {
    if (typeof prim === 'number') {
      let candidate = this._primativesByID[prim];
      if (!hasValue(candidate))
        throw new Error('the primative\'s ID is not recognized within this collision frame');
      prim = candidate;
    } else {
      let candidate = this._primativesByID[prim.id];
      if (candidate !== prim)
        throw new Error('the primative is not recognized within this collision frame');
    }

    let proxy = this._simpleProxies[prim.id];
    if (!hasValue(proxy)) {
      proxy = prim.makeProxyFor(this);
      this._simpleProxies[prim.id] = proxy;
    }
    return proxy;
  }

  /**
   * Always obtains a `MutableVector` instance, making one if one is
   * not already available for this ID.
   * 
   * @param {number} id
   * @returns {MutableVector}
   */
  getDeltaFor(id: number): MutableVector {
    let delta = this._deltas[id];
    if (hasValue(delta)) return delta;
    return this._deltas[id] = this.registerAsOwned(MutableVector.create(0, 0));
  }

  getIslandFor(id: number): Maybe<TOIIsland> {
    return this._primToIslands[id];
  }

  setIslandFor(id: number, island: Maybe<TOIIsland>) {
    this._primToIslands[id] = island;
  }

  registerAsOwned<T extends IOwnable>(owned: T): T {
    this._ownedObjs.push(owned);
    return owned;
  }
}

export default CollisionFrame;