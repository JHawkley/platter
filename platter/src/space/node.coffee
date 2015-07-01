`import Matrix from '../math/matrix'`
`import lowestCommonAncestor from '../utils/lowest-common-ancestor'`

# Working matrix.
wm = new Matrix()

# NOTE: Potential for infinite loops if there are circular references
# in the tree.  There are no special checks for this condition.
recurse = (node, stopAt, fn) ->
  if not node?
    if stopAt?
      throw new Error('expected to find `stopAt` as an ancestor, but did not')
  else if node is stopAt or recurse(node.parent, stopAt, fn) isnt false
    return fn(node)
  return

curTypeShift = 0

class Node

  @types: {}
  
  @addType: (type) ->
    Node.types[type] ?= (1 << (curTypeShift++))
    throw new Error('too many node types') if curTypeShift > 30
    return Node.types[type]

  # Gets of sets the parent of this node.
  # NOTE: `_parent` is set by `wasAdoptedBy()` when its new parent
  # calls it during adoption.
  Object.defineProperty @prototype, 'parent',
    get: -> @_parent
    set: (val) ->
      return if val is @_parent
      @_parent?.orphanObj(this)
      val?.adoptObj(this)
  
  Object.defineProperty @prototype, 'type',
    get: -> @_type

  constructor: -> throw new Error('this class is abstract and is not instantiable')
  
  destroy: ->
    if @_parent?
      throw new Error('cannot be destroyed while still adopted by a group')
  
  # Abstract constructor for this class.  Should be called by sub-class
  # constructors to be properly constructed.
  @init: (instance, x, y, type) ->
    instance.x = x ? 0
    instance.y = y ? 0
    instance._parent = null
    instance._type = type ? 0x00000000
  
  # Applies a function `fn` to all ancestors of the node, starting
  # from the node's parent, heading up to the root.  The iteration
  # will stop if `fn` returns `false`.
  iterateUpToRoot: (fn) ->
    parent = @parent
    while parent?
      return if fn(parent) is false
      parent = parent.parent
    return
  
  # Applies a function `fn` to all ancestors of the node, starting
  # from the root, heading down to the node's parent. The iteration
  # will stop if `fn` returns `false`.
  iterateDownFromRoot: (fn) -> recurse(@parent, null, fn)
  
  # Applies a function `fn` to all ancestors of the node, starting from
  # `ancestor` down to the node's parent.  The iteration will stop if `fn`
  # returns `false`.
  #
  # NOTE: Will throw an exception if `ancestor` is not actually an
  # ancestor of the node.
  iterateDownFrom: (ancestor, fn) -> recurse(@parent, ancestor, fn)
  
  # Informs the node that it has been adopted by the given `group`.
  wasAdoptedBy: (group) ->
    if @_parent?
      throw new Error('already adopted by another group')
    @_parent = group
  
  # Informs the node that it has been orphaned by the given `group`.
  wasOrphanedBy: (group) ->
    if @_parent isnt group
      throw new Error('can only be orphaned by the node\'s current parent')
    @_parent = null
  
  # Attaches the node to the given `group`.  No transformations are applied.
  attach: (group) -> @parent = group
  
  # Detaches the node from the tree.  No transformations are applied.
  detach: -> @parent = null
  
  # Lifts the node up to the root, applying the position transforms of
  # each ancestor, excluding the root, on its way up, maintaining its
  # position in root-space.
  lift: ->
    wm.reset()
    target = null
    @iterateDownFromRoot (anc) ->
      if target?
        wm.translate(anc.x, anc.y)
      else
        target = anc
      return
    @parent = target
    wm.applyToPoint(this)
    return this
  
  # Lifts the node completely out of the tree, applying the position
  # transforms of each ancestor on its way out, maintaining its position
  # in hyper-root-space (or whatever).
  liftOut: ->
    wm.reset()
    @iterateDownFromRoot (anc) ->
      wm.translate(anc.x, anc.y)
    @parent = null
    wm.applyToPoint(this)
    return this
  
  # Lifts the node up to the specified `ancestor`, applying the position
  # transforms of each ancestor on its way up, maintaining its position
  # in root-space.
  liftTo: (ancestor) ->
    wm.reset()
    @iterateDownFrom ancestor, (anc) ->
      return if anc is ancestor
      wm.translate(anc.x, anc.y)
    @parent = ancestor
    wm.applyToPoint(this)
    return this
  
  # Drops the node down into the specified descendant of the node's parent,
  # applying position transforms on its way down, maintaining its position
  # in root-space.
  dropInto: (descendant) ->
    wm.reset()
    parent = @parent
    descendant.iterateDownFrom parent, (anc) ->
      return if anc is parent
      wm.translate(anc.x, anc.y)
    # Don't forget to add the descendant's transforms as well.
    wm.translate(descendant.x, descendant.y)
    wm.inverse()
    @parent = descendant
    wm.applyToPoint(this)
    return this
  
  # Moves the node into a new group, somewhere on the same tree, applying
  # position transforms such that the position of the node in root-space
  # is unchanged.
  #
  # NOTE: This implementation may need to be changed if altering the parent
  # twice (once to the LCA, then again to the target group), will generate
  # unintended side-effects.
  jumpInto: (group) ->
    lca = lowestCommonAncestor(this, group)
    throw new Error('cannot jump into a node from another tree') unless lca?
    @liftTo(lca)
    @dropInto(group)
  
  toString: -> "Platter.space.Node({x: #{@x}, y: #{@y}})"

`export default Node`