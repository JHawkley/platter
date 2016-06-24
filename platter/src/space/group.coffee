`import Factory from '../factory/base'`
`import Node, { methods as nodeMethods } from './node'`
`import CallbackType from '../callback/type'`
`import { group as typeGroup } from './_type'`
`import CallbackOptions from '../callback/options'`
`import Rect from '../math/rect'`
`import { iteratorSymbol, isIterable } from '../utils/es6'`
`import { isArray } from '../utils/array'`

workingRect = Rect.create()

groupFactory = new Factory class extends Node

  @init: (instance, x, y) -> super(instance, x, y)

  Object.defineProperty @prototype, 'filter',
    get: -> @_data.filter

  constructor: ->
    super()
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
  
  # Adopts a single node as a child.
  adopt: (obj) ->
    if obj is this
      throw new Error('a group may not adopt itself')
    type = obj.type
    if @filter.test(obj.type)
      @children.push obj
      obj.wasAdoptedBy?(this)
    else
      throw new Error('object is not a permitted type for this group')
    return this
  
  # Adopts one or more nodes as children.
  adoptObjs: ->
    @adopt(obj) for obj in arguments
    return this
  
  # Orphans a node.  This function does nothing if the
  # node is already not a child of this group instance.
  orphan: (obj) ->
    idx = @children.indexOf obj
    return if idx is -1
    @children.splice(idx, 1)
    obj.wasOrphanedBy?(this)
    return this
  
  # Orphans one or more nodes.
  orphanObjs: ->
    @orphan(obj) for obj in arguments
    return this
  
  # Converts the group into a rectangle that represents the bounds of
  # the group's children and sets it to `out`.
  toRect: (out) ->
    top = left = Number.POSITIVE_INFINITY
    bottom = right = Number.NEGATIVE_INFINITY
    
    for child in @children when child.children?.length isnt 0
      wr = child.toRect(workingRect)
      top = Math.min(top, wr.top)
      left = Math.min(left, wr.left)
      bottom = Math.max(bottom, wr.bottom)
      right = Math.max(right, wr.right)
    
    if not wr?
      out.setProps(@x, @y, 0, 0)
    else
      out.x = left + @x; out.y = top + @y
      out.width = right - left
      out.height = bottom - top
    
    return out
  
  toString: -> "Platter.space.Group##{@id}({x: #{@x}, y: #{@y}})"

methods =
  # Sets the filter, excluding certain types of nodes from being
  # children of the group.
  #
  # This has no relation to the primative `mask` and `group`
  # filters, which have to do with what they may collide with.
  filter:
    init: -> @filter = { included: [], excluded: [] }
    seal: ->
      filter = @filter
      @filter = new CallbackOptions(filter.included).excluding(filter.excluded).seal()
  # Allows a specific node type to be added to the group.
  # If never applied, the finalizer will default to all types.
  include:
    apply: (cbType) ->
      if isArray(cbType)
        @filter.included.push(cbType...)
      else
        @filter.included.push cbType
    finalize: ->
      if @filter.included.length is 0
        @filter.included.push CallbackType.get('all')
  # Prevents a specific node type from being added to the group.
  exclude:
    apply: (cbType) ->
      if isArray(cbType)
        @filter.excluded.push(cbType...)
      else
        @filter.excluded.push cbType
  # Provides the node type.
  typeGroup:
    finalize: -> @type.push typeGroup

for k, v of nodeMethods
  groupFactory.method(k, v)
for k, v of methods
  groupFactory.method(k, v)

`export { methods }`
`export default groupFactory`