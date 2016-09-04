import { hasValue, getOrElse } from 'common/monads';

interface IGenerator<T> {
  readonly isSealed: boolean;
  seal: () => this;
  create: (...args: Array<any>) => T;
}

interface IGeneratorable {
  readonly id: number;
  _immutData: any;
  release: () => void;
  destroy?: () => void;
}

interface IGeneratorMethod {
  name: string;
  init?: () => void;
  apply?: (...args: Array<any>) => void;
  finalize?: () => void;
  seal?: () => void;
}

const emptyMap: { [key: string]: IGeneratorMethod } = {};
Object.freeze(emptyMap);

function createInstance<T extends IGeneratorable>(): T {
  let id: number = this._idGetter();
  let o: T = this._createInstance();
  let pool: Array<IGeneratorable> = this._pool;
  Object.defineProperties(o, {
    release: { value: function release() {
        if (hasValue(this.destroy)) this.destroy();
        this._immutData = null;
        pool.push(this);
      }},
    id: { value: id }
  });
  return o;
}

abstract class Generator<T extends IGeneratorable> implements IGenerator<T> {

  get isSealed(): boolean { return this._stage !== 0; }
  
  protected _definition: any;

  private _pool: Array<T>;
  private _stage: number;
  private _applicableSealers: { [key: string]: boolean };
  private _idGetter: () => number;
  private get _methods(): { [key: string]: IGeneratorMethod } {
    return getOrElse((<typeof Generator> this.constructor).methods, emptyMap);
  }

  /**
   * An array of all the methods installed.
   * This value should be an own property of the derived class constructor.
   * It will be initialized by `installMethod()` when it is called.
   * 
   * @static
   * @type {{ [key: string]: IGeneratorMethod }}
   */
  static methods: { [key: string]: IGeneratorMethod };

  /**
   * Installs the given method onto a generator class.
   * 
   * @static
   * @param {typeof Generator} Klass The class to install the method into.
   * @param {IGeneratorMethod} meth The method to install.
   * @param {any} [name=meth.name] The customized name to give the method.
   */
  static installMethod(Klass: typeof Generator, meth: IGeneratorMethod, name = meth.name): void {
    let methods = Klass.methods;
    if (!hasValue(methods)) {
      methods = {};
      Object.defineProperty(Klass, 'methods', { value: methods });
    }

    if (hasValue(methods[name])) {
      if (methods[name] !== meth)
        throw new Error('method already defined with a different definition');
      return;
    }
    
    methods[name] = meth;
    if (hasValue(meth.apply)) {
      let methApply = meth.apply;
      Object.defineProperty(Klass.prototype, name, { value: function applyMethod() {
        if (this.isSealed)
          throw new Error('cannot apply method; generator is sealed');
        methApply.apply(this._definition, arguments);
        this._applicableSealers[name] = true;
        return this;
      }});
    }
  }

  /**
   * Checks that the given class constructor has a method installed on it.
   * If `meth` is provided, it will check that `name` corresponds to a method that
   * matches the given method.
   * 
   * @static
   * @param {typeof Generator} Klass Klass The generator class to check.
   * @param {string} name The name of the method to check for.
   * @param {IGeneratorMethod} [meth] The method definition to match.
   * @returns {boolean}
   */
  static hasMethod(Klass: typeof Generator, name: string, meth?: IGeneratorMethod): boolean {
    let methods = Klass.methods;
    if (!hasValue(methods)) return false;
    if (hasValue(meth)) return methods[name] === meth;
    return hasValue(methods[name]);
  }

  /**
   * Creates an instance of `Generator`.
   * 
   * @param {Array<T>} poolInstance The factory's pool for reclaimed objects.
   * @param {() => number} idGetter A function to get the next ID for a newly constructed object.
   */
  constructor(poolInstance: Array<T>, idGetter: () => number) {
    this._definition = {};
    this._applicableSealers = {};
    this._pool = poolInstance;
    this._idGetter = idGetter;
    this._stage = 0;

    const methods = this._methods;
    for (let k in methods) {
      let meth = methods[k];
      if (hasValue(meth.init))
        meth.init.call(this._definition);
    }
  }

  /**
   * Seals the definition, preventing further changes to it.
   * 
   * @returns {this}
   */
  seal(): this {
    const methods = this._methods;
    if (this._stage !== 0)
      throw new Error('stage invalid for sealing');

    for (var k in methods) {
      let meth = methods[k];
      if (hasValue(meth.finalize))
        meth.finalize.call(this._definition);
      this._applicableSealers[k] = true;
    }
    
    for (var k in this._applicableSealers) {
      let meth = methods[k];
      if (hasValue(meth.seal))
        meth.seal.call(this._definition);
    }
    
    Object.freeze(this._definition);
    this._stage = 1;
    return this;
  }

  /**
   * Generates an object instance and applies the immutable definition to it.
   * If the generator was not sealed, the generator will seal and prevent more
   * than this one instantiation.
   * 
   * @param {...Array<any>} args The arguments to pass to the initializer function.
   * @returns {T}
   */
  create(...args: Array<any>): T{
    switch (this._stage) {
      case 0:
        this.seal();
        this._stage = -1;
        break;
      case 1:
        this._stage = 2;
        break;
      case -1:
        throw new Error('cannot create more than one when unsealed');
    }
    let obj = getOrElse<T>(this._pool.pop(), createInstance, this);
    obj._immutData = this._definition;
    return this._initializeInstance(obj, ...args);
  }

  /**
   * Applies the named method's `apply` function to the definition data.
   * 
   * @param {string} name The name of the method to `apply`.
   * @param {...Array<any>} args The arguments to pass to the method's `apply` function.
   * @returns {this}
   */
  applyMethod(name: string, ...args: Array<any>): this {
    if (this.isSealed)
      throw new Error('cannot apply method; generator is sealed');
    const meth = this._methods[name];
    if (!hasValue(meth) || !hasValue(meth.apply))
      throw new Error('method has no `apply` function');
    meth.apply.apply(this._definition, args);
    this._applicableSealers[name] = true;
    return this;
  }

  protected abstract _createInstance(): T;

  protected abstract _initializeInstance(instance: T, ...args: Array<any>): T;
}

/**
 * Installs a method onto a class, when used as a property decorator.
 * Uses the property key as the name for the method.  This decorator
 * is best used when the method has an `apply` function.
 * 
 * @param {IGeneratorMethod} meth The method to install.
 */
function ApplyMethod(meth: IGeneratorMethod) {
  return function MethodDecorator<T extends IGeneratorable>(klassProto: Generator<T>, key: string) {
    let Klass = <typeof Generator> klassProto.constructor;
    Generator.installMethod(Klass, meth, key);
  }
}

/**
 * Installs a method onto a class, when used as a class decorator.
 * Use this decorator when the method lacks an `apply` function.
 * 
 * @param {IGeneratorMethod} meth The method to install.
 * @param {string} [name=meth.name] The name to give the method.
 * @returns
 */
function InstallMethod(meth: IGeneratorMethod, name = meth.name) {
  return function MethodDecorator(Klass: typeof Generator) {
    Generator.installMethod(Klass, meth, name);
  }
}

export { IGenerator, IGeneratorable, IGeneratorMethod };
export { Generator, ApplyMethod, InstallMethod};
export default Generator;