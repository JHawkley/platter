class Rect
  
  # Preperation for object-pooling.
  @init: (instance, x, y, w, h) ->
    instance.x = x ? 0
    instance.y = y ? 0
    instance.width = w ? 0
    instance.height = h ? 0
  @create: (x, y, w, h) -> new Rect(x, y, w, h)
  @reclaim: (obj) -> return
  release: -> Rect.reclaim(this)
  
  Object.defineProperty @prototype, 'left',
    get: -> @x
    enumerable: true
  
  Object.defineProperty @prototype, 'top',
    get: -> @y
    enumerable: true
  
  Object.defineProperty @prototype, 'right',
    get: -> @x + @width
    enumerable: true
  
  Object.defineProperty @prototype, 'bottom',
    get: -> @y + @height
    enumerable: true
  
  constructor: (x, y, w, h) -> Rect.init(this, x, y, w, h)
  
  set: (other) ->
    @x = other.x
    @y = other.y
    @width = other.width
    @height = other.height
    return this
  
  setProps: (x, y, w, h) ->
    @x = x
    @y = y
    @width = w
    @height = h
    return this
  
  copy: -> Rect.create(@x, @y, @width, @height)
  asMutable: -> Rect.create(@x, @y, @width, @height)
  asImmutable: -> ImmutableRect.create(@x, @y, @width, @height)
  
  toRect: (out) -> out.set(this); return out
  
  toString: ->
    str = "{x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}}"
    return "Platter.math.MutableRect(#{str})"

class ImmutableRect extends Rect

  # Immutable rects can't be pooled, but we'll permit the interface
  # for consistency with other rect types.
  @create: (x, y, w, h) -> new ImmutableRect(x, y, w, h)
  @reclaim: -> return
  release: -> return
  
  constructor: (x, y, w, h) ->
    super(x, y, w, h)
    Object.freeze(this)
  
  set: -> throw new Error('rect is immutable')
  setProps: -> throw new Error('rect is immutable')
  
  copy: -> this
  asImmutable: -> this
  
  toString: ->
    str = "{x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}}"
    return "Platter.math.ImmutableRect(#{str})"

`export { Rect as MutableRect }`
`export { ImmutableRect }`
`export default Rect`