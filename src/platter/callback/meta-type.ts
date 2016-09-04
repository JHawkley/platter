import CallbackType from './type';
import { isArray } from '../utils/array';
import { Maybe, hasValue } from 'common/monads';

let anonCounter = 0;

function procType(cbType: CallbackType, data: any) {
  let newContributors = cbType.contributors;
  if (hasValue(newContributors)) {
    for (let i = 0, len = newContributors.length; i < len; i++)
      procType(newContributors[i], data);
  } else {
    let myContributors = data.contributors;
    let value = cbType.value;
    if (value !== 0 && !(value & data.value)) {
      myContributors.push(cbType);
      data.value |= value;
    }
  }
}

/**
 * Represents a custom cluster of callback-types.  Unlike callback-groups, these
 * instances are unique and cannot be obtained through `CallbackType.add()` or `.get()`.
 * The must be constructed using the `new` keyword.
 * 
 * @class CallbackMetatype
 * @extends {CallbackType}
 */
class CallbackMetatype extends CallbackType {

  /**
   * Provides a list of callback-types that have contributed to this meta-type's `value`.
   * 
   * @readonly
   * @type {Maybe<Array<CallbackType>>}
   */
  get contributors(): Array<CallbackType> {
    return this._data.contributors as Array<CallbackType>;
  }

  /**
   * Creates an anonymous instance of `CallbackMetatype` with no value.
   */
  constructor();

  /**
   * Creates an instance of `CallbackMetatype`, with the provided `name` and no value.
   * 
   * @param {string} name The name to give to the callback-metatype.
   */
  constructor(name: string);
  
  /**
   * Creates an anonymous instance of CallbackMetatype, with a value created by
   * one or more callback-types.
   * 
   * @param {(CallbackType | Array<CallbackType>)} types
   */
  constructor(types: CallbackType | Array<CallbackType>);
  
  /**
   * Creates an instance of CallbackMetatype, with the given `name` and a value
   * created by one or more callback-types.
   * 
   * @param {string} name
   * @param {(CallbackType | Array<CallbackType>)} types
   */
  constructor(name: string, types: CallbackType | Array<CallbackType>);
  
  constructor(name?: any, types?: any) {
    let tName: Maybe<string>, tTypes: Maybe<CallbackType | Array<CallbackType>>;
    let argsLength = hasValue(types) ? 2 : (hasValue(name) ? 1 : 0);
    super();
    if (argsLength === 2) {
      tName = name;
      tTypes = types;
    } else if (argsLength === 1) {
      if (name instanceof CallbackType || isArray(name)) {
        tTypes = name;
        tName = null;
      } else {
        tName = name;
        tTypes = null;
      }
    } else {
      tName = null;
      tTypes = null;
    }

    if (!hasValue(tName))
      tName = `anonymous-${++anonCounter}`;
    
    let data = { name: tName, value: 0x00000000, contributors: [] as Array<CallbackType> };

    if (isArray(tTypes))
      for (let i = 0, len = tTypes.length; i < len; i++)
        procType(tTypes[i], data);
    else if (hasValue(tTypes))
      procType(tTypes, data);
    
    Object.freeze(data.contributors);
    Object.freeze(data);
    this._data = data;
  }

  /**
   * Returns a string representation of the callback-metatype.
   * 
   * @returns {string}
   */
  toString(): string { return `[object Platter.callback.MetaType#${this.name}(${this._getValueString()})]`; }
}

export default CallbackMetatype;