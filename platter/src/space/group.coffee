`import Node from './node'`
`import findBounds from '../utils/find-bounds'`
`import { iteratorSymbol, isIterable } from '../utils/es6'`

class Group extends Node

  typeGroup = Node.addType 'group'

  constructor: -> throw new Error('this class is abstract and is not instantiable')
  
  # Abstract constructor for this class.  Should be called by sub-class
  # constructors to be properly constructed.
  @init: (instance, x, y, filter, group) ->
    group = (group ? 0x00000000) | typeGroup
    Node.init(instance, x, y, group)
    instance._filteredNodeTypes = filter ? 0x00000000
    instance.children = []
    instance._rect = {}
  
  # ES6-compatible iterator.  Is used by `Platter.utils.es6.forUsing()`
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
    if !!(@_filteredNodeTypes & (obj.type ? 0x00000000))
      throw new Error('object is not a permitted type for this group')
    @children.push obj
    obj.wasAdoptedBy?(this)
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
  
  toString: -> "Platter.space.Group({x: #{@x}, y: #{@y}})"

`export default Group`