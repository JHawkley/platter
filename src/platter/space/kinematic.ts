import { Group } from './group';
import { Node, TypeMethod } from './node';
import { IncludeMethod, ExcludeMethod } from './group';
import { FilterMethod as GroupFilterMethod, SetTypeMethod as GroupSetTypeMethod } from './group';
import CallbackType from '../callback/type';
import { Kinematic as typeKinematic, Group as tGroup } from './types';
import VectorInterpolation from '../math/vector-interpolation';
import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';

/**
 * A special kind of group that can contain any node that is not a `group`,
 * and whose children will only be tested for collisions with dynamics.
 * 
 * @class Kinematic
 * @extends {Group}
 */
class Kinematic extends Group {

  /**
   * Adopts a single node as a child.
   * NOTE: Special exception to always allow nodes of the `null` type.
   * 
   * @param {Node} obj The node to adopt.
   * @returns {this}
   */
  adopt(obj: Node): this {
    if (obj === this)
      throw new Error('a group may not adopt itself');
    if (this._checkType(obj.type)) {
      this.children.push(obj);
      obj.wasAdoptedBy(this);
    } else {
      throw new Error('object is not a permitted type for this group');
    }
    return this;
  }

  /**
   * Returns a string representation of the kinematic.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.space.Kinematic#${this.id}({x: ${this.x}, y: ${this.y}})]`; }

  private _checkType(type: CallbackType): boolean {
    if (type.value === 0x00000000) return true;
    if (this.filter.test(type)) return true;
    return false;
  }
}

export const FilterMethod = {
  name: 'filter',
  init() { this.filter = { included: [], excluded: [tGroup] }; },
  seal() { GroupFilterMethod.seal.call(this); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() {
    GroupSetTypeMethod.finalize.call(this);
    this.type.push(typeKinematic);
  }
}

const Methods = compileMethods([FilterMethod, SetTypeMethod]);

@InstallMethod(FilterMethod)
@InstallMethod(SetTypeMethod)
class KinematicGenerator extends Generator<Kinematic> {
  
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
   * @returns {Container}
   */
  create(x?: number, y?: number): Kinematic { return super.create(x, y); };

  protected _createInstance(): Kinematic { return new Kinematic(); }

  protected _initializeInstance(o: Kinematic, x: number, y: number): Kinematic {
    return Group.init(o, x, y);
  }
}

const KinematicFactory = Factory.for(KinematicGenerator);

export { Kinematic, KinematicFactory, Methods, typeKinematic as Type };
export default KinematicFactory;