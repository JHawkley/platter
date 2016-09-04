import { Node, TypeMethod } from './node';
import Rect from '../math/rect';
import CallbackType from '../callback/type';
import CallbackOptions from '../callback/options';
import { Group as typeGroup } from './types';
import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import { isArray, removeAtFast as removeAt } from '../utils/array';
import { isIterable } from '../utils/es6';
import { Maybe, hasValue, getOrElse } from 'common/monads';

type GroupData = {
  type: CallbackType,
  filter: CallbackOptions
}

const { min, max } = Math;
const workingRect = Rect.create();

/**
 * Contains other nodes.  Groups have a configurable filter that can be
 * used to determine what can or can't be included as a child.
 * 
 * @class Group
 * @extends {Node}
 */
class Group extends Node {

  /**
   * The children nodes of the group.
   * 
   * @readonly
   * @type {Array<Node | Group>}
   */
  readonly children: Array<Node | Group>;

  // Redefinition of `IGeneratorable._immutData`'s type.
  _immutData: GroupData;

  /**
   * The filter for this group.  Any node that fails to pass this filter's
   * `test()` function will not be allowed to be a child of this group.
   * 
   * @readonly
   * @type {CallbackOptions}
   */
  get filter(): CallbackOptions { return this._immutData.filter; }

  /**
   * Initializes the group.
   * 
   * @static
   * @template T
   * @param {T} instance The `Group` instance to initialize.
   * @returns {T}
   */
  static init<T extends Group>(instance: T, x = 0, y = 0): T {
    instance.x = x;
    instance.y = y;
    return instance;
  }

  /**
   * Creates an instance of `Group`.
   */
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.children = [];
  }

  /**
   * Destroys the group.
   * 
   * Throws if the group has any children.  They must be removed before
   * the group can be destroyed.
   */
  destroy() {
    if (this.children.length > 0)
      throw new Error('cannot be destroyed with children adopted');
    super.destroy();
  }

  /**
   * Obtains an iterator that will visit each of the group's descendant nodes.
   * It will not visit other groups, even if they are empty.
   * 
   * @returns {Iterator<Node>}
   */
  [Symbol.iterator](): Iterator<Node> {
    let it: IteratorResult<Node>;
    let currentIndex = 0;
    let subIterator: Maybe<Iterator<Node>> = null;
    let result: IteratorResult<Node> = { value: null as any, done: false };
    return {
      next: () => {
        if (hasValue(subIterator)) {
          if ((it = subIterator.next()).done !== true) {
            result.value = it.value;
            return result;
          } else subIterator = null;
        }
        while (true) {
          if (currentIndex < this.children.length) {
            let child = this.children[currentIndex++];
            if (isIterable<Node>(child)) {
              let si = child[Symbol.iterator]();
              if ((it = si.next()).done !== true) {
                subIterator = si;
                result.value = it.value;
                return result;
              }
              continue;
            } else {
              result.value = child;
              return result;
            }
          } else {
            result.value = null as any;
            result.done = true;
            return result;
          }
        }
      }
    }
  }

  /**
   * Adopts a single node as a child.
   * 
   * @param {Node} obj The node to adopt.
   * @returns {this}
   */
  adopt(obj: Node): this {
    if (obj === this)
      throw new Error('a group may not adopt itself');
    if (this.filter.test(obj.type)) {
      this.children.push(obj);
      obj.wasAdoptedBy(this);
    } else {
      throw new Error('object is not a permitted type for this group')
    }
    return this;
  }

  /**
   * Adopts one or more nodes as children.
   * 
   * @param {...Array<Node>} nodes The nodes to adopt.
   * @returns {this}
   */
  adoptObjs(...nodes: Array<Node>): this;
  adoptObjs(): this {
    for (let i = 0, len = arguments.length; i < len; i++) this.adopt(arguments[i]);
    return this;
  }

  /**
   * Orphans the given node.  Does nothing if this node is not a child of
   * this group.
   * 
   * @param {Node} obj The node to orphan.
   * @returns {this}
   */
  orphan(obj: Node): this {
    let idx = this.children.indexOf(obj);
    if (idx === -1) return this;
    removeAt(this.children, idx);
    obj.wasOrphanedBy(this);
    return this;
  }

  /**
   * Orphans one or more nodes, if that node is a child of this group.
   * 
   * @param {...Array<Node>} nodes The nodes to orphan.
   * @returns {this}
   */
  orphanObjs(...nodes: Array<Node>): this;
  orphanObjs(): this {
    for (let i = 0, len = arguments.length; i < len; i++) this.orphan(arguments[i]);
    return this;
  }

  /**
   * Calculates the group's bounding box, including all containing children, and
   * sets the result to the given rectangle `out`.
   * 
   * NOTE: If empty, the rectangle will have a `width` and `height` of `0`.
   * 
   * @template T
   * @param {T} out The rectangle to which the result will be set.
   * @returns {T}
   */
  toRect(out: Rect): Rect {
    let wr: Maybe<Rect> = null;
    let top: number, left: number;
    top = left = Number.POSITIVE_INFINITY;
    let bottom: number, right: number;
    bottom = right = Number.NEGATIVE_INFINITY;

    for (var i = 0, len = this.children.length; i < len; i++) {
      let child = <Group> this.children[i];
      if ((hasValue(child.children) ? child.children.length === 0 : false)) continue;
      wr = child.toRect(workingRect);
      top = min(top, wr.top);
      left = min(left, wr.left);
      bottom = max(bottom, wr.bottom);
      right = max(right, wr.right);
    }

    if (!wr) {
      out.setProps(this.x, this.y, 0, 0);
    } else {
      out.x = left + this.x; out.y = top + this.y;
      out.width = right - left;
      out.height = bottom - top;
    }

    return out;
  }

  /**
   * Returns a string representation of the group.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.space.Group#${this.id}({x: ${this.x}, y: ${this.y}})]`; }
}

export const FilterMethod = {
  name: 'filter',
  init() { this.filter = { included: [], excluded: [] }; },
  seal() {
    let filter = this.filter;
    this.filter = new CallbackOptions(filter.included).excluding(filter.excluded).seal();
  }
}

export const IncludeMethod = {
  name: 'include',
  apply(cbType: CallbackType | Array<CallbackType>) {
    if (isArray(cbType)) this.filter.included.push(...cbType);
    else this.filter.included.push(cbType);
  },
  finalize() {
    if (this.filter.included.length === 0)
      this.filter.included.push(CallbackType.get('all'));
  }
}

export const ExcludeMethod = {
  name: 'exclude',
  apply(cbType: CallbackType | Array<CallbackType>) {
    if (isArray(cbType)) this.filter.excluded.push(...cbType);
    else this.filter.excluded.push(cbType);
  }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() { this.type.push(typeGroup); }
}

const Methods = compileMethods([FilterMethod, IncludeMethod, ExcludeMethod, SetTypeMethod]);

@InstallMethod(FilterMethod)
@InstallMethod(SetTypeMethod)
class GroupGenerator extends Generator<Group> {
  
  /**
   * Adds the given type to the generated object.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Adds the given type as an inclusion to the group's filter.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to include.
   * @returns {this}
   */
  @ApplyMethod(IncludeMethod)
  include: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Adds the given type as an exclusion to the group's filter.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to exclude.
   * @returns {this}
   */
  @ApplyMethod(ExcludeMethod)
  exclude: (cbType: CallbackType | Array<CallbackType>) => this;

  /**
   * Creates a new `Group` instance, with the specified offset coordinates.
   * 
   * @param {number} [x=0] The `x` coordinate.
   * @param {number} [y=0] The `y` coordinate.
   * @returns {Group}
   */
  create(x?: number, y?: number): Group { return super.create(x, y); };

  protected _createInstance(): Group { return new Group(); }

  protected _initializeInstance(o: Group, x: number, y: number): Group {
    return Group.init(o, x, y);
  }
}

const GroupFactory = Factory.for(GroupGenerator);

export { Group, GroupFactory, Methods, typeGroup as Type };
export default GroupFactory;