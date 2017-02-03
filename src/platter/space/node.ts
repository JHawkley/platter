import { Group } from './group';
import Vector from '../math/vector';
import { set } from '../math/vector-math';
import Matrix from '../math/matrix';
import CallbackType from '../callback/type';
import CallbackMetatype from '../callback/meta-type';
import { isArray } from '../utils/array';
import compileMethods from '../factory/compile-methods';
import lowestCommonAncestor from '../utils/lowest-common-ancestor';
import { Maybe, hasValue, getOrElse } from 'common/monads';

type NodeIterator = (node: Node) => any;
type NodeData = { type: CallbackType };

let tNull = CallbackType.get('null');
let wv = Vector.create();
let wm = new Matrix();

function recurse(node: Maybe<Node>, stopAt: Maybe<Node>, fn:NodeIterator, thisArg?: any): any {
  if (!hasValue(node)) {
    if (hasValue(stopAt))
      throw new Error('expected to find `stopAt` as an ancestor, but did not');
  } else if(node === stopAt || recurse(node.parent, stopAt, fn, thisArg) !== false) {
    return fn.call(thisArg, node);
  }
}

/**
 * The base for anything that can be added to the simulation.
 * 
 * @abstract
 * @class Node
 */
abstract class Node {

  /**
   * The `x` component of the node's position, offset to its parent.
   * 
   * @type {number}
   */
  x: number;

  /**
   * The `y` component of the node's position, offset to its parent.
   * 
   * @type {number}
   */
  y: number;

  // IGenerateable members.

  /**
   * The ID of this node, given to it by its factory.
   * 
   * @type {number}
   */
  id: number;
  
  /**
   * Releases the node back to its object pool.
   */
  release: () => void;

  /**
   * The immutable data for the node.
   * 
   * @type {NodeData}
   */
  _immutData: NodeData;

  /**
   * The group that contains this node.
   * NOTE: `_parent` is set by `wasAdoptedBy()` when its new parent
   * calls it during adoption.
   */
  get parent() { return this._parent; }
  set parent(val) {
    if (this._parent === val) return;
    if(hasValue(this._parent)) this._parent.orphan(this);
    if(hasValue(val)) val.adopt(this);
  }

  /**
   * The type assigned to this object.
   * 
   * @readonly
   * @type {CallbackType}
   */
  get type(): CallbackType { return getOrElse(this._immutData.type, tNull); }

  protected _parent: Maybe<Group>;

  /**
   * Creates an instance of `Node`.
   */
  constructor() { this._parent = null; }

  /**
   * Destroys the node.
   * Throws if the node is still a part of a group.
   */
  destroy() {
    if (hasValue(this._parent))
      throw new Error('cannot be destroyed while still adopted by a group');
  }

  /**
   * Applies a function `fn` to all ancestors of the node, starting
   * from the node's parent, heading up to the root.  The iteration
   * will stop if `fn` returns `false`.
   * 
   * @param {NodeIterator} fn The function to apply each iteration.
   * @param {*} [thisArg] The object to be used as the current object for `fn`.
   */
  iterateUpToRoot(fn: NodeIterator, thisArg?: any): void {
    let parent = this.parent;
    while (hasValue(parent)) {
      if (fn.call(thisArg, parent) === false) return;
      parent = parent.parent;
    }
  }

  /**
   * Applies a function `fn` to all ancestors of the node, starting
   * from the root, heading down to the node's parent. The iteration
   * will stop if `fn` returns `false`.
   * 
   * @param {NodeIterator} fn The function to apply each iteration.
   * @param {*} [thisArg] The object to be used as the current object for `fn`.
   */
  iterateDownFromRoot(fn: NodeIterator, thisArg?: any): void { recurse(this.parent, null, fn, thisArg); }

  /**
   * Applies a function `fn` to all ancestors of the node, starting from
   * `ancestor` down to the node's parent.  The iteration will stop if `fn`
   * returns `false`.
   *
   * NOTE: Will throw an exception if `ancestor` is not actually an
   * ancestor of the node.
   * 
   * @param {Maybe<Node>} ancestor The ancestor from which iteration should start.
   * @param {NodeIterator} fn The function to apply each iteration.
   * @param {*} [thisArg] The object to be used as the current object for `fn`.
   */
  iterateDownFrom(ancestor: Maybe<Node>, fn: NodeIterator, thisArg?: any): void {
    recurse(this.parent, ancestor, fn, thisArg);
  }

  /**
   * Informs the node that it has been adopted by the given `group`.
   * 
   * @param {Group} group The group adopting the node.
   */
  wasAdoptedBy(group: Group) {
    if (hasValue(this._parent))
      throw new Error('already adopted by another group');
    this._parent = group;
  }

  /**
   * Informs the node that it has been orphaned by the given `group`.
   * 
   * @param {Group} group The group orphaning the node.
   */
  wasOrphanedBy(group: Group) {
    if (group !== this._parent)
      throw new Error("can only be orphaned by the node's current parent");
    this._parent = null;
  }

  /**
   * Attaches the node to the given `group`, leaving any group it may presently
   * be a member of.  No transformations are applied.
   * 
   * @param {Group} group The group to join.
   */
  attach(group: Group) { this.parent = group; }

  /**
   * Detaches the node from the tree.  No transformations are applied.
   */
  detach() { this.parent = null; }

  /**
   * Lifts the node up to the root, applying the position transforms of
   * each ancestor, excluding the root, on its way up, maintaining its
   * position in root-space.  The root node will become this node's
   * parent.
   * 
   * @returns {this}
   */
  lift(): this {
    wm.reset();
    let target: Maybe<Group> = null;
    this.iterateDownFromRoot((anc) => {
      if (hasValue(target)) wm.translate(anc);
      else target = <any> anc;
    });
    this.parent = target;
    wm.applyToPoint(this);
    return this;
  }

  /**
   * Lifts the node completely out of the tree, applying the position
   * transforms of each ancestor on its way out, maintaining its position
   * in hyper-root-space (or whatever you want to call it).
   * 
   * @returns {this}
   */
  liftOut(): this {
    wm.reset();
    this.iterateDownFromRoot((anc) => wm.translate(anc));
    this.parent = null;
    wm.applyToPoint(this);
    return this;
  }

  /**
   * Lifts the node up to the specified `ancestor`, applying the position
   * transforms of each ancestor on its way up, maintaining its position
   * in root-space.  The `ancestor` will become this node's parent.
   * 
   * NOTE: Will throw an exception if `ancestor` is not actually an
   * ancestor of the node.
   * 
   * @param {Group} ancestor The ancestor to lift this node up to.
   * @returns {this}
   */
  liftTo(ancestor: Group): this {
    wm.reset();
    this.iterateDownFrom(ancestor, (anc) => {
      if (anc === ancestor) return;
      wm.translate(anc);
    });
    this.parent = ancestor;
    wm.applyToPoint(this);
    return this;
  }

  /**
   * Drops the node down into the specified descendant of the node's parent,
   * applying position transforms on its way down, maintaining its position
   * in root-space.  The `descendant` will become this node's parent.
   * 
   * @param {Group} descendant The descendant of the parent node to drop this node into.
   * @returns {this}
   */
  dropInto(descendant: Group): this {
    wm.reset();
    let parent = this.parent;
    descendant.iterateDownFrom(parent, (anc) => {
      if (anc === parent) return;
      wm.translate(anc);
    });
    wm.translate(descendant);
    wm.invert();
    this.parent = descendant;
    wm.applyToPoint(this);
    return this;
  }

  /**
   * Moves the node into a new group, somewhere on the same tree, applying
   * position transforms such that the position of the node in root-space
   * is unchanged.
   * 
   * @param {Group} group The group, within the same tree, to move this node to.
   * @returns {this}
   */
  jumpInto(group: Group): this {
    let lca = lowestCommonAncestor(this, group);
    if (!hasValue(lca))
      throw new Error('cannot jump into a node from another tree');

    // Get our current position.
    let cPos = set(wv, this);
    // Up to LCA.
    wm.reset();
    this.iterateDownFrom(lca, (anc) => {
      if (anc === lca) return;
      wm.translate(anc);
    });
    wm.applyToPoint(cPos);
    // LCA is node's present 'parent'.
    // Down into group.
    wm.reset();
    group.iterateDownFrom(lca, (anc) => {
      if (anc === group) return;
      wm.translate(anc);
    });
    wm.translate(group);
    wm.invert();
    // Group is the node's parent.  Time to make it official.
    wm.applyToPoint(cPos);
    this.parent = group;
    set(this, cPos);

    return this;
  }

  /**
   * Returns a string representation of the node.
   * 
   * @returns {string}
   */
  toString(): string {
    let x = getOrElse<number | string>(this.x, '--');
    let y = getOrElse<number | string>(this.y, '--');
    return `[object Platter.space.Node#${this.id}({x: ${x}, y: ${y}})]`;
  }
}

export const TypeMethod = {
  name: 'type',
  init() { this.type = []; },
  apply(cbType: CallbackType | Array<CallbackType>) {
    if (isArray(cbType))
      this.type.push(...cbType);
    else
      this.type.push(cbType);
  },
  seal() {
    let type = this.type;
    this.type = type.length > 0 ? new CallbackMetatype(type): null;
  }
}

const Methods = compileMethods([TypeMethod]);

export { Node, Methods };
export default Node;