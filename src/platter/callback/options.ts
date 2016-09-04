import CallbackType from './type';
import { isArray } from '../utils/array';
import { hasValue } from 'common/monads';

interface ICallbackOptions {
  readonly included: number;
  readonly excluded: number;
  readonly isStrict: boolean;
  including(cbTypes: Array<CallbackType> | CallbackType): CallbackOptions;
  excluding(cbTypes: Array<CallbackType> | CallbackType): CallbackOptions;
  test(cbType: CallbackType): boolean;
}

type OptData = { included: number, excluded: number, strict: boolean, sealed: boolean };

class CallbackOptions implements ICallbackOptions {

  private _data: OptData;

  /**
   * What values are to be considered included.
   * 
   * @readonly
   * @type {number}
   */
  get included(): number { return this._data.included; }

  /**
   * What values are to be considered excluded.
   * 
   * @readonly
   * @type {number}
   */
  get excluded(): number { return this._data.excluded; }

  /**
   * Whether `test()` will check that the callback-types's `value` exactly equals
   * this instance's `included` value.
   * 
   * @readonly
   * @type {boolean}
   */
  get isStrict(): boolean { return this._data.strict; }

  /**
   * Whether this instance has been rendered immutable.
   * 
   * @readonly
   * @type {boolean}
   */
  get isSealed(): boolean { return this._data.sealed; }

  /**
   * Creates an instance of `CallbackOptions`.
   * 
   * @param {(CallbackType | Array<CallbackType>)} [includedTypes] The callback-types to include.
   */
  constructor(includedTypes?: CallbackType | Array<CallbackType>) {
    this._data = { included: 0, excluded: 0, strict: false, sealed: false };
    if (hasValue(includedTypes)) this.including(includedTypes)
  }

  /**
   * Includes one or more callback-types.
   * Inclusions have lower priority versus exclusions.
   * 
   * @param {(Array<CallbackType> | CallbackType)} cbTypes The callback-types to include.
   * @returns {this}
   */
  including(cbTypes: Array<CallbackType> | CallbackType): this {
    let data = this._data;
    if (isArray(cbTypes))
      for (let i = 0, len = cbTypes.length; i < len; i++)
        data.included |= cbTypes[i].value;
    else
      data.included |= cbTypes.value;
    return this;
  }

  /**
   * Excludes one or more callback-types.
   * Exclusions have higher priority versus inclusions.
   * 
   * @param {(Array<CallbackType> | CallbackType)} cbTypes The callback-types to exclude.
   * @returns {this}
   */
  excluding(cbTypes: Array<CallbackType> | CallbackType): this {
    let data = this._data;
    if (isArray(cbTypes))
      for (let i = 0, len = cbTypes.length; i < len; i++)
        data.excluded |= cbTypes[i].value;
    else
      data.excluded |= cbTypes.value;
    return this;
  }

  /**
   * Sets this instance to check that the callback-types's `value` exactly equals
   * this instance's `included` value.
   * 
   * @returns {this}
   */
  strict(): this { this._data.strict = true; return this; }

  /**
   * Renders this instance immutable.
   * 
   * @returns {this}
   */
  seal(): this {
    let data = this._data;
    data.sealed = true;
    Object.freeze(data);
    return this;
  }

  /**
   * Tests whether the given callback-type is a member of this callback-option.
   * Exclusions have a priority over inclusions.
   * 
   * @param {CallbackType} cbType The `CallbackType` instance to test.
   * @returns {boolean}
   */
  test(cbType: CallbackType): boolean {
    let data = this._data, value = cbType.value;
    if (data.excluded & value) return false;
    if (data.strict) return data.included === value;
    return !!(data.included & value);
  }

  toString(): string { return '[object Platter.callback.Options]'; }
}

export { ICallbackOptions, CallbackOptions };
export default CallbackOptions;