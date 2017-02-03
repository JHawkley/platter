import { Generator, IGeneratorable, IGeneratorMethod } from './generator';
import nextId from '../utils/uid';
import { Maybe, hasValue, getOrElse } from 'common/monads';

interface _GeneratorConstructor<T extends IGeneratorable, GI extends Generator<T>> {
  new(poolInstance: Array<T>, idGetter: () => number): GI;
}

type GeneratorConstructor<T extends IGeneratorable, GI extends Generator<T>>
  = _GeneratorConstructor<T, GI> & typeof Generator;

type BasicFactory<T extends IGeneratorable> = Factory<T, Generator<T>, GeneratorConstructor<T, Generator<T>>>;

function makeShortHandGenerator<GI>(): GI {
  return this._SHGen = this.define().seal();
}

class Factory<T extends IGeneratorable, GI extends Generator<T>, GC extends GeneratorConstructor<T, GI>> {
  private _GeneratorCtor: GC;
  private _SHGen: Maybe<GI>;
  private _pool: Array<T>;

  protected get _shortHandGenerator(): GI {
    return getOrElse<GI>(this._SHGen, makeShortHandGenerator, this);
  };

  /**
   * Creates a factory for the given generator.
   * 
   * @static
   * @template T
   * @template GI
   * @template GC
   * @param {(GC & { new(poolInstance: Array<T>, idGetter: () => number): GI })} Gen The generator class to base the factory around.
   * @returns {Factory<T, GI, GC>}
   */
  static for<T extends IGeneratorable, GI extends Generator<T>, GC extends GeneratorConstructor<T, GI>>(Gen: GC & { new(poolInstance: Array<T>, idGetter: () => number): GI }): Factory<T, GI, GC> {
    return new (class extends Factory<T, GI, GC> {})(Gen);
  }

  /**
   * Creates a factory from the given class constructor, creating an anonymous
   * generator class.
   * 
   * @static
   * @template T
   * @param {{ new(): T }} Klass The class the factory will produce instances of.
   * @returns {BasicFactory<T>}
   */
  static from<T extends IGeneratorable>(Klass: { new(): T }): BasicFactory<T>;
  
  /**
   * Creates a factory from the given class constructor, creating an anonymous
   * generator class and installing the given methods to it.
   * 
   * @static
   * @template T
   * @param {{ new(): T }} Klass The class the factory will produce instances of.
   * @param {...Array<IGeneratorMethod>} methods One or more methods to install on the anonymous generator.
   * @returns {BasicFactory<T>}
   */
  static from<T extends IGeneratorable>(Klass: { new(): T }, ...methods: Array<IGeneratorMethod>): BasicFactory<T>;
  
  /**
   * Creates a factory from the given class constructor, creating an anonymous
   * generator class using the provided initializer function to initialize any
   * instances it creates.
   * 
   * @static
   * @template T
   * @param {{ new(): T }} Klass The class the factory will produce instances of.
   * @param {(instance: T, ...args: Array<any>) => T} initializer A function used to initialize instances when `create()` is called.
   * @returns {BasicFactory<T>}
   */
  static from<T extends IGeneratorable>(Klass: { new(): T }, initializer: (instance: T, ...args: Array<any>) => T): BasicFactory<T>;
  
  /**
   * Creates a factory from the given class constructor, creating an anonymous
   * generator class using the provided initializer function to initialize any
   * instances it creates and installing the given methods to it.
   * 
   * @static
   * @template T
   * @param {{ new(): T }} Klass The class the factory will produce instances of.
   * @param {(instance: T, ...args: Array<any>) => T} initializer A function used to initialize instances when `create()` is called.
   * @param {...Array<IGeneratorMethod>} methods One or more methods to install on the anonymous generator.
   * @returns {BasicFactory<T>}
   */
  static from<T extends IGeneratorable>(Klass: { new(): T }, initializer: (instance: T, ...args: Array<any>) => T, ...methods: Array<IGeneratorMethod>): BasicFactory<T>;
  static from<T extends IGeneratorable>(Klass: { new(): T }) {
    let initializer: Maybe<(instance: T, ...args: Array<any>) => T>;
    let methodsStart = 1;

    if (arguments.length === 1) {
        initializer = null;
    } else {
      let arg1 = arguments[1];
      if (typeof arg1 === 'function') {
        initializer = arg1;
        methodsStart = 2;
      } else {
        initializer = null;
      }
    }

    let Gen = class extends Generator<T> {
      protected _createInstance() { return new Klass(); }
      protected _initializeInstance() {
        if (hasValue(initializer)) initializer.apply(null, arguments);
        return arguments[0];
      }
    }

    for (let i = methodsStart, len = arguments.length; i < len; i++) {
      let meth: IGeneratorMethod = arguments[i];
      Generator.installMethod(Gen, meth);
    }

    return Factory.for(Gen);
  }

  /**
   * Creates an instance of `Factory`.
   * 
   * @param {(GC & { new(poolInstance: Array<T>, idGetter: () => number): GI })} Gen The generator class to base the factory around.
   */
  constructor(Gen: GC & { new(poolInstance: Array<T>, idGetter: () => number): GI }) {
    this._GeneratorCtor = Gen;
    this._SHGen = null;
    this._pool = [];
  }

  /**
   * Creates and returns a new generator.  If methods with an `apply` function
   * were installed, use those methods to customize the immutable data of the
   * object instances the generator will produce.
   * 
   * @returns {GI}
   */
  define(): GI {
    return new this._GeneratorCtor(this._pool, () => nextId());
  }

  /**
   * Creates an object instance with no method customization.
   * 
   * @param {...Array<any>} args The arguments to pass to the object initializer.
   * @returns {T}
   */
  create(...args: Array<any>): T;
  create(): T {
    let shg = this._shortHandGenerator;
    return shg.create.apply(shg, arguments);
  }

  /**
   * Checks that the generator given to this factory has a method installed on it.
   * If `meth` is provided, it will check that `name` corresponds to a method that
   * matches the given method.
   * 
   * @param {string} name The name of the method to check for.
   * @param {IGeneratorMethod} [meth] The method definition to match.
   * @returns {boolean}
   */
  hasMethod(name: string, meth?: IGeneratorMethod): boolean {
    return Generator.hasMethod(this._GeneratorCtor, name, meth);
  }
}

export default Factory;