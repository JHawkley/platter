import { Group } from './group';
import { TypeMethod } from './node';
import { ExcludeMethod, FilterMethod as GroupFilterMethod, SetTypeMethod as GroupSetTypeMethod } from './group';
import CallbackType from '../callback/type';
import { Container as typeContainer, Group as tGroup } from './types';
import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';

/**
 * A special kind of group that can only contain other groups types.
 * Much of the implementation is in the factory's methods.
 * 
 * @class Container
 * @extends {Group}
 */
class Container extends Group {

  /**
   * Returns a string representation of the container.
   * 
   * @returns {string}
   */
  toString(): string  { return `[object Platter.space.Container#${this.id}({x: ${this.x}, y: ${this.y}})]`; }
}

export const FilterMethod = {
  name: 'filter',
  init() { this.filter = { included: [tGroup], excluded: []}; },
  seal() { GroupFilterMethod.seal.call(this); }
}

export const SetTypeMethod = {
  name: 'setType',
  finalize() {
    GroupSetTypeMethod.finalize.call(this);
    this.type.push(typeContainer);
  }
}

const Methods = compileMethods([FilterMethod, SetTypeMethod]);

@InstallMethod(FilterMethod)
@InstallMethod(SetTypeMethod)
class ContainerGenerator extends Generator<Container> {
  
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
   * @returns {Container}
   */
  create(x?: number, y?: number): Container { return super.create(x, y); };

  protected _createInstance(): Container { return new Container(); }

  protected _initializeInstance(o: Container, x: number, y: number): Container {
    return Group.init(o, x, y);
  }
}

const ContainerFactory = Factory.for(ContainerGenerator);

export { Container, ContainerFactory, Methods, typeContainer as Type };
export default ContainerFactory;