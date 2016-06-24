# Quad-tree implementation based on an implementation © 2012 Timo Hausmann.
# Distributed under MIT License.
# https://github.com/timohausmann/quadtree-js

`import Rect from '../math/rect'`

workingRect = Rect.create()

quadNone = 0
quadTL = (1 << 0)
quadTR = (1 << 1)
quadBL = (1 << 2)
quadBR = (1 << 3)

pool = []

class QuadTree
  @FLAGS: { quadNone, quadTL, quadTR, quadBL, quadBR }

  @create: (x, y, w, h, maxObjects, maxLevels, level) ->
    instance = pool.pop() ? new QuadTree()
    return QuadTree.init(instance, x, y, w, h, maxObjects, maxLevels, level)
  
  @reclaim: (instance) -> pool.push instance
  
  @init: (instance, x, y, w, h, maxObjects, maxLevels, level) ->
    if typeof x isnt 'number'
      # Assume `x` is a bounds object.
      maxObjects = y
      maxLevels = w
      level = h
      { x, y, width: w, height: h } = x
    
    instance.maxObjects = maxObjects ? 10
    instance.maxLevels = maxLevels ? 4
    instance.level = level ? 0
    instance.bounds.setProps(x, y, w, h)
    return instance
  
  constructor: ->
    @objects = []
    @nodes = null
    @bounds = Rect.create()
  
  # Splits the quad-tree into four child nodes, one for each quadrant.
  split: ->
    lev = @level + 1
    mo = @maxObjects
    ml = @maxLevels
    
    { x, y, width, height } = @bounds
    x = Math.round(x)
    y = Math.round(y)
    width = Math.round(width / 2)
    height = Math.round(height / 2)

    nodes = {}
    nodes[quadTL] = QuadTree.create(x, y, width, height, mo, ml, lev)
    nodes[quadTR] = QuadTree.create(x + width, y, width, height, mo, ml, lev)
    nodes[quadBL] = QuadTree.create(x, y + height, width, height, mo, ml, lev)
    nodes[quadBR] = QuadTree.create(x + width, y + height, width, height, mo, ml, lev)
    @nodes = nodes
    
    return
  
  # Gets a set of flags indicating which child nodes can contain the object.
  getQuads: (object) ->
    rect = object.toRect?(workingRect) ? object
    quads = quadNone
    vm = @bounds.x + (@bounds.width / 2)
    hm = @bounds.y + (@bounds.height / 2)
    
    { x, y, width: w, height: h } = rect

    leftQuadrant = x <= vm
    rightQuadrant = x + w >= vm
    
    if y <= hm
      if leftQuadrant then quads |= quadTL
      if rightQuadrant then quads |= quadTR
    if y + h >= hm
      if leftQuadrant then quads |= quadBL
      if rightQuadrant then quads |= quadBR
    
    return quads
  
  # Inserts an object into the quad-tree.
  insert: (object) ->
    if @nodes?
      quads = @getQuads(object)
      if quads in [quadTL, quadTR, quadBL, quadBR]
        @nodes[quads].insert(object)
        return
    
    @objects.push(object)
    
    if @objects.length > @maxObjects and @level < @maxLevels
      @split() unless @nodes?
      
      i = 0
      while i < @objects.length
        quads = @getQuads(@objects[i])
        if quads in [quadTL, quadTR, quadBL, quadBR]
          @nodes[quads].insert(@objects.splice(i, 1)[0])
        else
          i += 1
    return
  
  # Retrieves an array of all objects the given object may overlap.
  retrieve: (object) ->
    arrs = [@objects]
    
    if @nodes?
      quads = @getQuads(object)
      for q, node of @nodes when quads & q
        arrs.push node.retrieve(object)
    
    return Array::concat.call(arrs...)
  
  release: ->
    @clear()
    QuadTree.reclaim(this)
  
  # Clears the quad-tree and resets it to use the provided bounds.
  reset: (bounds) ->
    @clear()
    @bounds.x = bounds.x
    @bounds.y = bounds.y
    @bounds.width = bounds.width
    @bounds.height = bounds.height
  
  # Clears the quad-tree of all objects.
  clear: ->
    @objects = []
    if @nodes? then for k, node of @nodes 
      node.release()
    @nodes = null
  
  # Creates a string representation of the quad-tree, including all
  # sub-trees and their objects.
  toString: ->
    indent = (new Array(@level + 1)).join('  ')
    parts = []
    parts.push "Quad-Tree (level #{@level})"
    parts.push '-Objects-'
    if @objects.length > 0
      for object in @objects
        parts.push object.toString()
    else
      parts.push '(empty)'
    parts.push ''
    parts.push '--Nodes--'
    if @nodes?
      str = parts.map((part) -> indent + part).join('\r\n')
      for quad, node of @nodes
        str += '\r\n'
        str += switch Number(quad)
          when quadTL then indent + '@ top-left\r\n'
          when quadTR then indent + '@ top-right\r\n'
          when quadBL then indent + '@ bottom-left\r\n'
          when quadBR then indent + '@ bottom-right\r\n'
        str += node.toString()
    else
      parts.push '(empty)'
      parts.push ''
      str = parts.map((part) -> indent + part).join('\r\n')
    return str

`export default QuadTree`