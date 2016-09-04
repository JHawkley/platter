import { Maybe, hasValue } from 'common/monads';
import ProxyLine from './proxy-line';
import LineLike from '../types/line-like';
import Primative from '../geom/primative';
import { Line } from '../geom/line';
import { ChainLink } from '../geom/chain-link';
import { Kinematic } from '../space/kinematic';

class ProxyChainLink extends ProxyLine {

  geometry: ChainLink;
  proxied: ChainLink;

  get next(): Maybe<ProxyChainLink> {
    let next = this._swapAdjacentLinks ? this.proxied.prev : this.proxied.next;
    if (!next) return null;
    else return this.owner.getProxyFor(next);
  }

  get prev(): Maybe<ProxyChainLink> {
    let prev = this._swapAdjacentLinks ? this.proxied.next : this.proxied.prev;
    if (!prev) return null;
    else return this.owner.getProxyFor(prev);
  }

  private _swapAdjacentLinks: boolean;

  static create(owner: any, proxied: ChainLink): ProxyChainLink {
    let instance = new ProxyChainLink();
    return ProxyChainLink.init(instance, owner, proxied);
  }

  static init(instance: ProxyChainLink, owner: any, proxied: ChainLink): ProxyChainLink {
    ProxyLine.init(instance, owner, proxied, proxied);

    let flipX = false, flipY = false;
    let parent = proxied.parent;
    if (hasValue(parent))
      if (parent instanceof Kinematic)
        ({ flipX, flipY } = parent);
    
    instance._swapAdjacentLinks = (flipX !== flipY);
    return instance;
  }

  static reclaim(instance: ProxyChainLink) { return; }

  toString(): string {
    let pt1 = `{x: ${this.point1.x}, y: ${this.point1.y}}`;
    let pt2 = `{x: ${this.point2.x}, y: ${this.point2.y}}`;
    return `[object Platter.phys.ProxyChainLink#${this.id}(${pt1}, ${pt2})]`;
  }
}

export default ProxyChainLink;