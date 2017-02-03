import nextId from '../utils/uid';
import CollisionFrame from './collision-frame';
import { Maybe, hasValue, getOrElse } from 'common/monads';

const pool: Array<TOIIsland> = [];

function spawn(): TOIIsland { return new TOIIsland(); }

/**
 * A list of primatives that are likely to interact with each other.
 * 
 * If primative A's swept bounds overlaps with primative B's, and primative B's
 * overlaps with primative C's, then A, B, and C are all part of the same island,
 * as A affecting B can change how B may affect C.
 * 
 * This class features a simple linked-list capability that is used to rapidly
 * traverse and merge/discard islands.
 * 
 * @class TOIIsland
 */
class TOIIsland {

  /**
   * The island's current members, by ID.
   * 
   * @readonly
   * @type {Array<number>}
   */
  readonly members: Array<number>;
  
  /**
   * The island's ID.
   * 
   * @readonly
   * @type {number}
   */
  readonly id: number;
  
  /**
   * The previous island in the linked-list structure.
   * 
   * @type {Maybe<TOIIsland>}
   */
  prev: Maybe<TOIIsland>;
  
  /**
   * The next island in the linked-list structure.
   * 
   * @type {Maybe<TOIIsland>}
   */
  next: Maybe<TOIIsland>;

  /**
   * The collision frame that owns this island.
   * 
   * @type {CollisionFrame}
   */
  owner: CollisionFrame;

  /**
   * Whether this island is in a list.
   * 
   * @readonly
   * @type {boolean}
   */
  get inList(): boolean { return hasValue(this.prev) || hasValue(this.next); }

  /**
   * Whether this island is the head of the list it is in.
   * 
   * @readonly
   * @type {boolean}
   */
  get isHead(): boolean { return !hasValue(this.prev); }

  /**
   * Whether this island is the tail of the list it is in.
   * 
   * @readonly
   * @type {boolean}
   */
  get isTail(): boolean { return !hasValue(this.next); }

  /**
   * Creates an instance of `TOIIsland`, allocating a new instance if
   * one is not available in the pool.
   * 
   * @static
   * @param {number} [a] The island's first member.
   * @param {number} [b] The island's second member.
   * @returns {TOIIsland}
   */
  static create(owner: CollisionFrame, a?: number, b?: number): TOIIsland {
    let instance = getOrElse(pool.pop(), spawn);
    return TOIIsland.init(instance, owner, a, b);
  }

  /**
   * Initializes an island, adding up to two members to it.
   * 
   * @static
   * @param {TOIIsland} instance The instance to initialize.
   * @param {number} [a] The island's first member.
   * @param {number} [b] The island's second member.
   * @returns {TOIIsland}
   */
  static init(instance: TOIIsland, owner: CollisionFrame, a?: number, b?: number): TOIIsland {
    instance.owner = owner;
    if (hasValue(a)) instance.add(a);
    if (hasValue(b)) instance.add(b);
    return owner.registerAsOwned(instance);
  }

  /**
   * Reclaims an island, removing all members from the island,
   * and returning it to the pool.
   * 
   * @static
   * @param {TOIIsland} instance
   */
  static reclaim(instance: TOIIsland) {
    let { owner, members } = instance;
    for (let i = 0, len = members.length; i < len; i++)
      owner.setIslandFor(i, null);
    members.length = 0;
    instance.cutOut();
    instance.owner = null as any;
    pool.push(instance);
  }

  /**
   * Releases an entire linked-list of islands.
   * 
   * @static
   * @param {TOIIsland} island Any island in the list to be released.
   */
  static releaseList(island: TOIIsland) {
    let { prev, next } = island;
    while (hasValue(prev)) {
      let p = prev.prev;
      prev.release();
      prev = p;
    }
    while (hasValue(next)) {
      let n = next.next;
      next.release();
      next = n;
    }
    island.release();
  }

  /**
   * Creates an instance of `TOIIsland`.
   */
  constructor() {
    this.members = [];
    this.id = nextId();
    this.next = null;
    this.prev = null;
  }

  /**
   * Obtains an iterator that will visit each island in the linked-list structure.
   * 
   * @returns {Iterator<TOIIsland>}
   */
  [Symbol.iterator](): Iterator<TOIIsland> {
    let result: IteratorResult<TOIIsland> = { value: null as any, done: false };
    return {
      next: () => {
        if (hasValue(result.value)) {
          let next = result.value.next;
          if (hasValue(next)) {
            result.value = next;
            result.done = false;
          } else {
            result.value = null as any;
            result.done = true;
          }
        } else if(!result.done) {
          result.value = this;
        }
        return result;
      }
    }
  }
  
  /**
   * Inserts the given node after this node.
   * 
   * @param {TOIIsland} inserted The island to be inserted.
   * @returns {this}
   */
  insertAfter(inserted: TOIIsland): this {
    if (inserted.inList)
      throw new Error('inserted node cannot already be in a list');
    let n = this.next;
    this.next = inserted;
    inserted.prev = this;
    if (hasValue(n)) {
      inserted.next = n;
      n.prev = inserted;
    }
    return this;
  }

  /**
   * Inserts the given node before this node.
   * 
   * @param {TOIIsland} inserted The island to be inserted.
   * @returns {this}
   */
  insertBefore(inserted: TOIIsland): this {
    if (inserted.inList)
      throw new Error('inserted node cannot already be in a list');
    let p = this.prev;
    this.prev = inserted;
    inserted.next = this;
    if (hasValue(p)) {
      inserted.prev = p;
      p.next = inserted;
    }
    return this;
  }

  /**
   * Attempts to add the given primative to this island.  Will fail if the `candidate`
   * is a member of another island, unless `force` is set to `true`.
   * 
   * @param {number} candidate The ID of the primative to add to the island.
   * @param {boolean} [force=false] Whether to force the primative into the island, even if already part of another island.
   * @returns {this}
   */
  add(candidate: number, force = false): this {
    let cIsland = this.owner.getIslandFor(candidate);
    if (hasValue(cIsland)) {
      if (cIsland === this) return this;
      if (!force)
        throw new Error('candidate is already a member of another island');
    }
    this.owner.setIslandFor(candidate, this);
    this.members.push(candidate);
    return this;
  }

  /**
   * Absorbs the members of the `other` island into this island.
   * The other island will then be cut out of the island linked-list.
   * It will not release the other island, though.
   * 
   * @param {TOIIsland} other The island to absorb.
   * @returns {this}
   */
  absorb(other: TOIIsland): this {
    for (let i = 0, len = other.members.length; i < len; i++)
      this.add(other.members[i], true);
    other.members.length = 0;
    other.cutOut();
    return this;
  }

  /**
   * Removes this island from the linked-list structure.
   */
  cutOut(): void {
    let { next, prev } = this;
    if (hasValue(prev)) prev.next = next;
    if (hasValue(next)) next.prev = prev;
    this.prev = null;
    this.next = null;
  }

  /**
   * Releases this island, removing all members from the island,
   * and returning it to the pool.
   */
  release() { TOIIsland.reclaim(this); }

  /**
   * Returns a string representation of the island.
   * 
   * @returns {string}
   */
  toString(): string {
    return `[object Platter.phys.TOIIsland#${this.id}({members.length: ${this.members.length}})]`;
  }
}

export default TOIIsland;