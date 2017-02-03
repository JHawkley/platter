import { Node } from './node';
import { Group } from './group';
import { AABB } from '../geom/aabb';
import { Circle } from '../geom/circle';
import { Point as tPoint, AABB as tAABB, Circle as tCircle } from '../geom/types';
import { Group as tGroup, Dynamic as typeDynamic } from './types';
import { TypeMethod } from './node';
import { ExcludeMethod } from './group';
import { FilterMethod as GroupFilterMethod, SetTypeMethod as GroupSetTypeMethod } from './group';
import CallbackType from '../callback/type';
import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import { Maybe, hasValue } from 'common/monads';

const allowedTypes = [tAABB, tCircle, tPoint];
const canBeBody = tAABB.including(tCircle);

class Dynamic extends Group {

  /**
   * Flips the dynamic's children horizontally.
   * NOTE: This is carried out by the primative's proxy.
   * 
   * @type {boolean}
   */
  flipX: boolean;

  /**
   * Flips the dynamic's children horizontally.
   * NOTE: This is carried out by the primative's proxy.
   * 
   * @type {boolean}
   */
  flipY: boolean;

  /**
   * Alias for `flipX`.
   * 
   * @type {boolean}
   */
  get mirror(): boolean { return this.flipX; }
  set mirror(val: boolean) { this.flipX = val; }

  /**
   * Alias for `flipY`.
   * 
   * @type {boolean}
   */
  get invert(): boolean { return this.flipY; }
  set invert(val: boolean) { this.flipY = val; }

  /**
   * Initializes the dynamic.
   * 
   * @static
   * @template T
   * @param {T} instance The `Dynamic` to initialize.
   * @returns {T}
   */
  static init<T extends Dynamic>(instance: T): T {
    // These will be reflected by the primative proxies.
    instance.flipX = false;
    instance.flipY = false;
    return instance;
  }

  /**
   * Returns a string representation of the dynamic.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.space.Dynamic#${this.id}({x: ${this.x}, y: ${this.y}})]`; }
}

export const FilterMethod = {
  name: 'filter',
  init() { this.filter = { included: allowedTypes.slice(), excluded: [tGroup] }; },
  seal() { GroupFilterMethod.seal.call(this); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() {
    GroupSetTypeMethod.finalize.call(this);
    this.type.push(typeDynamic);
  }
}

const Methods = compileMethods([FilterMethod, SetTypeMethod]);

@InstallMethod(FilterMethod)
@InstallMethod(SetTypeMethod)
class DynamicGenerator extends Generator<Dynamic> {
  
  /**
   * Adds the given type to the generated object.
   * 
   * @param {CallbackType | Array<CallbackType>} cbType The CallbackType(s) to add.
   * @returns {this}
   */
  @ApplyMethod(TypeMethod)
  type: (cbType: CallbackType | Array<CallbackType>) => this;

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
   * @returns {Dynamic}
   */
  create(x?: number, y?: number): Dynamic { return super.create(x, y); };

  protected _createInstance(): Dynamic { return new Dynamic(); }

  protected _initializeInstance(o: Dynamic, x: number, y: number): Dynamic {
    Group.init(o, x, y);
    Dynamic.init(o);
    return o;
  }
}

const DynamicFactory = Factory.for(DynamicGenerator);

export { Dynamic, DynamicFactory, Methods, typeDynamic as Type };
export default DynamicFactory;