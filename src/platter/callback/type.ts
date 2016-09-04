import { ICallbackOptions, CallbackOptions } from './options';
import { isArray } from '../utils/array';
import { Maybe, hasValue } from 'common/monads';

type TypeData = { name: string, value: number, contributors?: Array<CallbackType> };

const zeroes = '00000000000000000000000000000000';
const types: { [name: string]: CallbackType } = {};
let curTypeShift = 0;

abstract class CallbackType implements ICallbackOptions {

  protected _data: TypeData;

  /**
   * The name given to this callback-type.
   * 
   * @readonly
   * @type {string}
   */
  get name(): string { return this._data.name; }

  /**
   * The underlying value that represents this callback-type.
   * 
   * @readonly
   * @type {number}
   */
  get value(): number { return this._data.value; }
  
  /**
   * Provides a list of callback-types that have contributed to a group's `value`.
   * This is always `null` if the callback-type is not a group.
   * 
   * @readonly
   * @type {Maybe<Array<CallbackType>>}
   */
  get contributors(): Maybe<Array<CallbackType>> { return null; }

  /**
   * What values are to be considered included, when treated as a `CallbackOption`.
   * 
   * @readonly
   * @type {number}
   */
  get included(): number { return this._data.value; }

  /**
   * What values are to be considered excluded, when treated as a `CallbackOption`.
   * 
   * @readonly
   * @type {number}
   */
  get excluded(): number { return 0; }

  /**
   * Whether `test()` will check that the callback-types's `value` exactly equals
   * this instance's `included` value.  Always `false` for all callback-types
   * except the null callback-type.
   * 
   * @readonly
   * @type {boolean}
   */
  get isStrict(): boolean { return false; }

  /**
   * The number of custom types that have been added so far.
   * No more can be added when this value reaches `31`.
   * 
   * @readonly
   * @static
   * @type {number}
   */
  static get count(): number { return curTypeShift; }

  /**
   * Gets the callback-type with the given `name`.
   * Throws if no such callback-type exists.  Using `add()` will always obtain
   * a callback-type even if one has not yet been created.
   * 
   * @static
   * @param {string} name The name of the callback-type.
   * @returns {CallbackType}
   */
  static get(name: string): CallbackType {
    let cbType = types[name];
    if (hasValue(cbType)) return cbType;
    throw new Error('no such type or group exists');
  }

  /**
   * Gets or creates a callback-type with the given `name`.
   * 
   * @static
   * @param {string} name The name of the callback-type.
   * @returns {CallbackType}
   */
  static add(name: string): CallbackType {
    let cbType = types[name];
    if (hasValue(cbType)) return cbType;
    let value = 1 << (curTypeShift++);
    if (curTypeShift > 31)
      throw new Error('too many callback types');
    return new CallbackUnit(name, value);
  }

  /**
   * Adds a callback-type to the callback-group with the given name, creating
   * a group if one does not exist.  Throws if the name is already taken
   * and it is not a callback-group.
   * 
   * @static
   * @param {string} name
   * @param {CallbackType} cbType
   * @returns {CallbackGroup}
   */
  static addToGroup(name: string, cbType: CallbackType): CallbackGroup {
    let cbGroup = <CallbackGroup> types[name];
    return hasValue(cbGroup) ? cbGroup.add(cbType) : new CallbackGroup(name, cbType);
  }

  /**
   * Creates a new `CallbackOption` instance with this callback-type and any
   * given callback-types included in it.
   * 
   * @param {(Array<CallbackType> | CallbackType)} cbTypes The callback-types to include.
   * @returns {CallbackOptions}
   */
  including(cbTypes: Array<CallbackType> | CallbackType): CallbackOptions {
    let newOption = new CallbackOptions(this);
    return newOption.including(cbTypes);
  }

  /**
   * Creates a new `CallbackOption` instance with this callback-type included,
   * gut the given callback-types excluded.
   * 
   * @param {(Array<CallbackType> | CallbackType)} cbTypes The callback-types to exclude.
   * @returns {CallbackOptions}
   */
  excluding(cbTypes: Array<CallbackType> | CallbackType): CallbackOptions {
    let newOption = new CallbackOptions(this);
    return newOption.excluding(cbTypes);
  }

  /**
   * Treating the callback-type as a callback-option, tests whether the given
   * callback-type has this instance's value.  This is not a strict test;
   * a callback-group with this callback-type as a contributor will pass
   * the test.
   * 
   * @param {CallbackType} cbType The `CallbackType` instance to test.
   * @returns {boolean}
   */
  test(cbType: CallbackType): boolean { return !!(this.value & cbType.value); }

  /**
   * Returns a string representation of the callback-type.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.callback.Type#${this.name}(${this._getValueString()})]`; }

  /**
   * Gets a binary representation of this callback-type's value.
   * 
   * @protected
   * @returns {string}
   */
  protected _getValueString(): string {
    let vStr = (this._data.value >>> 0).toString(2);
    return zeroes.substr(vStr.length) + vStr;
  }
}

class CallbackUnit extends CallbackType {

  constructor(name: string, value: number) {
    super();
    this._data = { name, value };
    Object.freeze(this._data);

    types[name] = this;
  }
}

new class CallbackNull extends CallbackType {

  /**
   * Whether `test()` will check that the callback-types's `value` exactly equals
   * this instance's `included` value.  Always `true` for the null callback-type.
   * 
   * @readonly
   * @type {boolean}
   */
  get isStrict(): boolean { return true; }

  constructor() {
    super();
    let name = 'null';
    this._data = { name, value: 0x00000000 };
    Object.freeze(this._data);

    types[name] = this;
  }

  /**
   * Treating the callback-type as a callback-option, tests whether the given
   * callback-type has this instance's value.  For the null callback-type,
   * any callback-type with a non-zero `value` will fail.
   * 
   * @param {CallbackType} cbType The `CallbackType` instance to test.
   * @returns {boolean}
   */
  test(cbType: CallbackType): boolean { return this.value === cbType.value; }
}

new class CallbackAll extends CallbackType {

  constructor() {
    super();
    let name = 'all';
    this._data = { name, value: ~0x00000000 };
    Object.freeze(this._data);

    types[name] = this;
  }
}

class CallbackGroup extends CallbackType {

  /**
   * Provides a list of callback-types that have contributed to this group's `value`.
   * 
   * @readonly
   * @type {Array<CallbackType>}
   */
  get contributors(): Array<CallbackType> {
    return this._data.contributors as Array<CallbackType>;
  }

  constructor(name: string, cbType: CallbackType) {
    super();
    let data = { name, value: 0x00000000, contributors: [] as Array<CallbackType> }
    this._data = data;
    this.add(cbType);

    if (data.contributors.length === 0)
      throw new Error('group has no valid contributors');
    
    types[name] = this;
  }

  /**
   * Adds the given callback-type to this group as a contributor.
   * 
   * @param {(CallbackType)} cbType The callback-type to add.
   * @returns {this}
   */
  add(cbType: CallbackType): this {
    let newContributors = cbType.contributors;
    if (hasValue(newContributors)) {
      for (let i = 0, len = newContributors.length; i < len; i++)
        this.add(newContributors[i]);
    } else if (cbType.value !== 0) {
      let myContributors = this.contributors;
      let i = myContributors.indexOf(cbType);
      if (i === -1) {
        myContributors.push(cbType);
        this._data.value |= cbType.value;
      }
    }
    return this;
  }

  /**
   * Returns a string representation of the callback-group.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.callback.TypeGroup#${this.name}(${this._getValueString()})]`; }
}

export default CallbackType;