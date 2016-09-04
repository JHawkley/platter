import RectLike from '../types/rect-like';

class MutableRect {
  
  /**
   * The `x` component of the rectangle's upper-left corner.
   * 
   * @type {number}
   */
  x: number;
  
  /**
   * The `y` component of the rectangle's upper-left corner.
   * 
   * @type {number}
   */
  y: number;
  
  /**
   * The width of the rectangle.
   * 
   * @type {number}
   */
  width: number;
  
  /**
   * The height of the rectangle.
   * 
   * @type {number}
   */
  height: number;

  /**
   * The position on the `x` axis of the rectangele's left-most boundary.
   * 
   * @readonly
   */
  get left() { return this.x; }
  
  /**
   * The position on the `y` axis of the rectangele's top-most boundary.
   * 
   * @readonly
   */
  get top() { return this.y; }
  
  /**
   * The position on the `x` axis of the rectangele's right-most boundary.
   * 
   * @readonly
   */
  get right() { return this.x + this.width; }
  
  /**
   * The position on the `y` axis of the rectangele's bottom-most boundary.
   * 
   * @readonly
   */
  get bottom() { return this.y + this.height; }

  /**
   * Creates a new `MutableRect`, allocating a new instance only if none is
   * available in the object-pool.
   * 
   * @static
   * @param {number} [x=0] The `x` component of the rectangle's upper-left corner.
   * @param {number} [y=0] The `y` component of the rectangle's upper-left corner.
   * @param {number} [w=0] The width of the rectangle.
   * @param {number} [h=0] The height of the rectangle.
   * @returns {MutableRect}
   */
  static create(x?: number, y?: number, w?: number, h?: number): MutableRect { return new MutableRect(x, y, w, h); }
  
  /**
   * Reclaims a `MutableRect`, returning it to the pool.
   * 
   * @static
   * @param {MutableRect} instance
   * @returns
   */
  static reclaim(instance: MutableRect) { return; }
  
  /**
   * Initializes the given rectangle with the given properties.
   * 
   * @static
   * @param {MutableRect} instance The rectangle instance to initialize.
   * @param {number} [x=0] The `x` component of the rectangle's upper-left corner.
   * @param {number} [y=0] The `y` component of the rectangle's upper-left corner.
   * @param {number} [w=0] The width of the rectangle.
   * @param {number} [h=0] The height of the rectangle.
   * @returns {MutableRect}
   */
  static init<T extends RectLike>(instance: T, x = 0, y = 0, w = 0, h = 0): T {
    instance.x = x;
    instance.y = y;
    instance.width = w;
    instance.height = h;
    return instance;
  }

  /**
   * Creates an instance of `MutableRect`.
   * 
   * @param {number} [x=0] The `x` component of the rectangle's upper-left corner.
   * @param {number} [y=0] The `y` component of the rectangle's upper-left corner.
   * @param {number} [w=0] The width of the rectangle.
   * @param {number} [h=0] The height of the rectangle.
   */
  constructor(x?: number, y?: number, w?: number, h?: number) {
    MutableRect.init(this, x, y, w, h);
  }

  /**
   * Releases the rectangle back to the object-pool.
   */
  release(): void { MutableRect.reclaim(this); }

  /**
   * Sets the properties of this rectangle to that of the `other` rectangle.
   * 
   * @param {RectLike} other The source of the new properties.
   * @returns {this}
   */
  set(other: RectLike): this {
    this.x = other.x;
    this.y = other.y;
    this.width = other.width;
    this.height = other.height;
    return this;
  }

  /**
   * Sets the properties of this rectangle.
   * 
   * @param {number} x The `x` component of the rectangle's upper-left corner.
   * @param {number} y The `y` component of the rectangle's upper-left corner.
   * @param {number} w The width of the rectangle.
   * @param {number} h The height of the rectangle.
   * @returns {this}
   */
  setProps(x: number, y: number, w: number, h: number): this {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    return this;
  }

  /**
   * Returns a new `MutableRect` that is identical to this rectangle.
   * 
   * @returns {MutableRect}
   */
  copy(): MutableRect { return MutableRect.create(this.x, this.y, this.width, this.height); }
  
  /**
   * Returns a new `MutableRect` that is identical to this rectangle.
   * 
   * @returns {MutableRect}
   */
  asMutable(): MutableRect { return MutableRect.create(this.x, this.y, this.width, this.height); }
  
  /**
   * Returns a new `ImmutableRect` that is identical to this rectangle.
   * 
   * @returns {ImmutableRect}
   */
  asImmutable(): ImmutableRect { return ImmutableRect.create(this.x, this.y, this.width, this.height); }

  /**
   * Copies the properties of this rectangle to `out`.
   * 
   * @param {MutableRect} out The destination for this rectangle's properties.
   * @returns {MutableRect}
   */
  toRect(out: MutableRect): MutableRect { return out.set(this); }

  /**
   * Returns a string representation of the rectangle.
   * 
   * @returns {string}
   */
  toString(): string {
    let str = `{x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
    return `[object Platter.math.MutableRect(${str})]`;
  }
}

class ImmutableRect extends MutableRect {
  
  /**
   * Creates a new `ImmutableRect`.
   * This method always allocates a new object, as this class cannot be pooled
   * due to being immutable; this method is only here for compliance with the
   * Poolable interface.
   * 
   * @static
   * @param {number} [x=0] The `x` component of the rectangle's upper-left corner.
   * @param {number} [y=0] The `y` component of the rectangle's upper-left corner.
   * @param {number} [w=0] The width of the rectangle.
   * @param {number} [h=0] The height of the rectangle.
   * @returns {ImmutableRect}
   */
  static create(x?: number, y?: number, w?: number, h?: number): ImmutableRect {
    return new ImmutableRect(x, y, w, h);
  }
  
  /**
   * Reclaims a `ImmutableRect`, returning it to the pool.
   * As this type is immutable, it can't be pooled, and this method actually
   * does nothing; it's only here for compliance with the Poolable interface.
   * 
   * @static
   * @param {ImmutableRect} instance
   * @returns
   */
  static reclaim(instance: ImmutableRect) { return; }

  /**
   * Creates an instance of `ImmutableRect`.
   * 
   * @param {number} [x=0] The `x` component of the rectangle's upper-left corner.
   * @param {number} [y=0] The `y` component of the rectangle's upper-left corner.
   * @param {number} [w=0] The width of the rectangle.
   * @param {number} [h=0] The height of the rectangle.
   */
  constructor(x?: number, y?: number, w?: number, h?: number) {
    super(x, y, w, h);
    Object.freeze(this);
  }

  /**
   * Sets the properties of this rectangle to that of the `other` rectangle.
   * 
   * @param {RectLike} other The source of the new properties.
   * @returns {this}
   */
  set(other: RectLike): this { throw new Error('rect is immutable'); }
  
  /**
   * Sets the properties of this rectangle.
   * 
   * @param {number} x The `x` component of the rectangle's upper-left corner.
   * @param {number} y The `y` component of the rectangle's upper-left corner.
   * @param {number} w The width of the rectangle.
   * @param {number} h The height of the rectangle.
   * @returns {this}
   */
  setProps(x: number, y: number, w: number, h: number): this { throw new Error('rect is immutable'); }

  /**
   * Returns an `ImmutableRect` that is identical to this rectangle.
   * Note: Because this type is immutable, this simply returns itself.
   * 
   * @returns {this}
   */
  copy(): this { return this; }
  
  /**
   * Returns an `ImmutableRect` that is identical to this rectangle.
   * Note: Because this type is immutable, this simply returns itself.
   * 
   * @returns {this}
   */
  asImmutable(): this { return this; }

  /**
   * Returns a string representation of the rectangle.
   * 
   * @returns {string}
   */
  toString(): string {
    let str = `{x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
    return `[object Platter.math.ImmutableRect(${str})]`;
  }
}

export { MutableRect, ImmutableRect };
export default MutableRect;