import { Node } from './node';
import { Group } from './group';
import { AABB } from '../geom/aabb';
import { Circle } from '../geom/circle';
import { Point as tPoint, AABB as tAABB, Circle as tCircle } from '../geom/types';
import { Group as tGroup, Kinematic as typeKinematic } from './types';
import { TypeMethod } from './node';
import { ExcludeMethod } from './group';
import { FilterMethod as GroupFilterMethod, SetTypeMethod as GroupSetTypeMethod } from './group';
import CallbackType from '../callback/type';
import VectorInterpolation from '../math/vector-interpolation';
import Factory from '../factory/base';
import { Generator, InstallMethod, ApplyMethod } from '../factory/generator';
import compileMethods from '../factory/compile-methods';
import { Maybe, hasValue } from 'common/monads';

type InstanceDataKinematic = {
  body: AABB | Circle,
  delta: VectorInterpolation
};

const allowedTypes = [tAABB, tCircle, tPoint];
const canBeBody = tAABB.including(tCircle);

class Kinematic extends Group {

  /**
   * Flips the kinematic's children horizontally.
   * NOTE: This is carried out by the primative's proxy.
   * 
   * @type {boolean}
   */
  flipX: boolean;

  /**
   * Flips the kinematic's children horizontally.
   * NOTE: This is carried out by the primative's proxy.
   * 
   * @type {boolean}
   */
  flipY: boolean;

  /**
   * The body for the kinematic.
   * 
   * @type {(Maybe<AABB | Circle>)}
   */
  get body(): Maybe<AABB | Circle> { return this._instanceData.body; }
  set body(val: Maybe<AABB | Circle>) { this.setBody(val); }

  /**
   * A `VectorInterpolation` object intended to describe the linear
   * motion the group and its children have made during the
   * current/next time-step.
   * 
   * @readonly
   * @type {VectorInterpolation}
   */
  get delta(): VectorInterpolation { return this._instanceData.delta; }

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

  private _instanceData: InstanceDataKinematic;

  /**
   * Initializes the kinematic.
   * 
   * @static
   * @template T
   * @param {T} instance The `Kinematic` to initialize.
   * @returns {T}
   */
  static init<T extends Kinematic>(instance: T): T {
    // These will be reflected by the primative proxies.
    instance.flipX = false;
    instance.flipY = false;
    return instance;
  }

  /**
   * Creates an instance of `Kinematic`.
   * 
   */
  constructor() {
    super();
    this._instanceData = { body: null as any, delta: new VectorInterpolation() };
  }

  /**
   * Destroys the kinematic.
   * 
   * Throws if the group has any children.  They must be removed before
   * the group can be destroyed.
   */
  destroy() {
    super.destroy();
    let _instanceData = this._instanceData;
    _instanceData.delta.clear();
    _instanceData.body = null as any;
  }

  /**
   * Sets the `body` property.  This function is handy as it can be
   * chained; as in: `Kinematic.create().adopt(body).setBody(body)`
   * 
   * @param {(Maybe<AABB | Circle>)} body The body to set.
   * @returns {this}
   */
  setBody(body: Maybe<AABB | Circle>): this {
    if (hasValue(body)) {
      if (body.parent !== this)
        throw new Error('a body must be a child of the kinematic');
      if (!canBeBody.test(body.type))
        throw new Error('only AABBs or Circles may be a body');
    }
    this._instanceData.body = <any> body;
    return this;
  }

  /**
   * Orphans the given node.  Does nothing if this node is not a child of
   * this kinematic.
   * 
   * @param {Node} obj The node to orphan.
   * @returns {this}
   */
  orphan(obj: Node): this {
    super.orphan(obj);
    if (obj === this._instanceData.body)
      this._instanceData.body = null as any;
    return this;
  }

  /**
   * Returns a string representation of the kinematic.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.space.Kinematic#${this.id}({x: ${this.x}, y: ${this.y}})]`; }
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
   * @returns {Kinematic}
   */
  create(x?: number, y?: number): Kinematic { return super.create(x, y); };

  protected _createInstance(): Kinematic { return new Kinematic(); }

  protected _initializeInstance(o: Kinematic, x: number, y: number): Kinematic {
    Group.init(o, x, y);
    Kinematic.init(o);
    return o;
  }
}

const KinematicFactory = Factory.for(KinematicGenerator);

export { Kinematic, KinematicFactory, Methods, typeKinematic as Type };
export default KinematicFactory;