`import Factory from '../factory/base'`
`import Node from './node'`
`import findBounds from '../utils/find-bounds'`
`import { iteratorSymbol, isIterable } from '../utils/es6'`

typeGroup = Node.addType 'group'

groupFactory = new Factory class extends Node

  Object.defineProperty @prototype, 'filter',
    get: -> @_data.filter

  constructor: (x, y) ->
    super(x, y)
    # Reusable object for `toRect()`.
    @_rect = {}
    @children = []
  
  destroy: ->
    if @children.length > 0
      throw new Error('cannot be destroyed with children adopted')
    super()
  
  # ES6-compatible iterator.  Is used by `Platter.utils.es6.iterateOn()`
  # to iterate over all the group's descendants.
  this.prototype[iteratorSymbol] = ->
    currentIndex = 0
    subIterator = null
    result = { value: null, done: false }
    return {
      next: =>
        if subIterator?
          if (it = subIterator.next()).done isnt true
            result.value = it.value
            return result
          else subIterator = null
        loop
          if currentIndex < @children.length
            child = @children[currentIndex++]
            if isIterable(child)
              si = child[iteratorSymbol]()
              if (it = si.next()).done isnt true
                subIterator = si
                result.value = it.value
                return result
              continue
            else
              result.value = child
              return result
          else
            result.value = null
            result.done = true
            return result
    }
  
  # Adopts one or more nodes as children.
  adopt: ->
    @adoptObj(obj) for obj in arguments
    return this
  
  # Adopts a single node as a child.
  adoptObj: (obj) ->
    if obj is this
      throw new Error('a group may not adopt itself')
    type = obj.type
    if !!(@filter.allowed & type) and !(@filter.excluded & type)
      @children.push obj
      obj.wasAdoptedBy?(this)
    else
      throw new Error('object is not a permitted type for this group')
    return this
  
  # Orphans one or more nodes.
  orphan: ->
    @orphanObj(obj) for obj in arguments
    return this
  
  # Orphans a node.  This function does nothing if the
  # node is already not a child of this group instance.
  orphanObj: (obj) ->
    idx = @children.indexOf obj
    return if idx is -1
    @children.splice(idx, 1)
    obj.wasOrphanedBy?(this)
    return this
  
  # Converts the group into a rectangle that represents the bounds of
  # the group's children.
  toRect: ->
    rectOut = @_rect
    rects = for child in @children when child.children?.length isnt 0
      child.toRect?() ? child
      
    findBounds(rects, rectOut)
    rectOut.x += @x
    rectOut.y += @y
    return rectOut
  
  toString: -> "Platter.space.Group##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter, excluding certain types of nodes from being
  # children of the group.
  #
  # This has no relation to the primative `mask` and `group`
  # filters, which have to do with what they may collide with.
  filter:
    init: -> @filter = { allowed: 0x00000000, excluded: 0x00000000 }
    seal: -> Object.freeze(@filter)
  # Allows a specific node type to be added to the group.
  # If never applied, the finalizer will default to all types.
  allow:
    apply: (flags) ->
      @filter.allowed |= flags
    finalize: ->
      if @filter.allowed is 0x00000000
        @filter.allowed = (~0x00000000 >>> 0)
  # Prevents a specific node type from being added to the group.
  exclude:
    apply: (flags) -> @filter.excluded |= flags
  # Provides the node type.
  type:
    finalize: -> @type = typeGroup

for k, v of methods
  groupFactory.method(k, v)

`export { methods, typeGroup as type }`
`export default groupFactory`