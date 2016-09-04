`import Factory from 'platter/factory/base'`
`import { Node as _Node, TypeMethod } from 'platter/space/node'`
`import CallbackType from 'platter/callback/type'`
`import CallbackMetatype from 'platter/callback/meta-type'`

cbTest1 = CallbackType.add('test-type-1')
cbTest2 = CallbackType.add('test-type-2')
cbTest3 = CallbackType.add('test-type-3')

Node = Factory.from((class extends _Node), TypeMethod)

class Group
  constructor: (@x, @y, parent = null) ->
    @children = []
    @parent = parent
    parent?.adopt(this)
  
  adopt: (obj) -> @adoptObj(obj)
  adoptObj: (obj) ->
    @children.push obj
    obj.wasAdoptedBy?(this)
  
  orphan: (obj) -> @orphanObj(obj)
  orphanObj: (obj) ->
    i = @children.indexOf(obj)
    @children.splice(i, 1)
    obj.wasOrphanedBy?(this)
    
  iterateUpToRoot: (fn) ->
    parent = @parent
    while parent?
      return if fn(parent) is false
      parent = parent.parent
    return
  
  # Naive implementation.
  iterateDownFromRoot: (fn) ->
    ancestors = []
    @iterateUpToRoot (anc) ->
      ancestors.push anc
    ancestors.reverse()
    for anc in ancestors
      return if fn(anc) is false
    return
  
  # Naive implementation.
  iterateDownFrom: (ancestor, fn) ->
    ancestors = []
    @iterateUpToRoot (anc) ->
      ancestors.push anc
      return false if ancestor is anc
    if ancestors.indexOf(ancestor) is -1
      throw new Error('could not find given group in this group\'s ancestors')
    ancestors.reverse()
    for anc in ancestors
      return if fn(anc) is false
    return
  
  toString: -> "Group({x: #{@x}, y: #{@y}})"

describe 'platter: space, node', ->
  
  node = null
  
  beforeEach -> node = Node.create()
  
  describe 'methods', ->
    
    describe 'type', ->
      
      it 'should initialize the type array', ->
        test = {}
        TypeMethod.init.call(test)
        
        expect(test.type).toEqual []
      
      it 'should provide a means to add a type', ->
        test = { type: [] }
        
        TypeMethod.apply.call(test, cbTest1)
        
        expect(test.type).toEqual [cbTest1]
      
      it 'should provide a means to add several types', ->
        test = { type: [] }
        
        TypeMethod.apply.call(test, [cbTest1, cbTest2, cbTest3])
        
        expect(test.type).toEqual [cbTest1, cbTest2, cbTest3]
      
      it 'should seal the types by creating a meta-type', ->
        test = { type: [ cbTest1, cbTest2, cbTest3 ] }
        sType = cbTest1.value | cbTest2.value | cbTest3.value
        
        TypeMethod.seal.call(test)
        
        expect(test.type instanceof CallbackMetatype).toBe true
        expect(test.type.value).toBe sType
  
  describe 'adoption & orphanage', ->
  
    it 'should set and clear `parent` when `wasAdoptedBy()` and `wasOrphanedBy()` are called, respectively', ->
      obj = {}
      expect(node.parent?).toBe false
      
      node.wasAdoptedBy(obj)
      expect(node.parent).toBe obj
      
      node.wasOrphanedBy(obj)
      expect(node.parent?).toBe false
    
    it 'should throw an error if the object passed to `wasOrphanedBy()` was not the node\'s parent', ->
      obj1 = {id: 1}
      obj2 = {id: 2}
      
      node.wasAdoptedBy(obj1)
      
      fn = -> node.wasOrphanedBy(obj2)
      
      expect(fn).toThrow()
    
    it 'should throw an error if `wasAdoptedBy()` is called while the node is already adopted', ->
      obj1 = {id: 1}
      obj2 = {id: 2}
      
      node.wasAdoptedBy(obj1)
      
      fn = -> node.wasAdoptedBy(obj2)
      
      expect(fn).toThrow()
  
  describe 'parentage', ->
  
    it 'should set `parent` to its adoptive group', ->
      group = new Group(0, 0)
      group.adopt(node)
      
      expect(node.parent).toBe group
    
    it 'should remove itself from its parent when `parent` is set to `null`', ->
      group = new Group(0, 0)
      group.adopt(node)
      
      expect(node.parent).toBe group
      expect(group.children).toContain node
      
      node.parent = null
      
      expect(group.children).not.toContain node
      expect(node.parent?).toBe false
    
    it 'should remove itself from its old parent when `parent` is set to another group', ->
      group1 = new Group(0, 0)
      group1.adopt(node)
      group2 = new Group(0, 0)
      
      expect(node.parent).toBe group1
      expect(group1.children).toContain node
      expect(group2.children).not.toContain node
      
      node.parent = group2
      
      expect(node.parent).toBe group2
      expect(group1.children).not.toContain node
      expect(group2.children).toContain node
    
    it 'should attach to a group', ->
      group = new Group(0, 0)
      expect(node.parent?).toBe false
      
      node.attach(group)
      
      expect(node.parent).toBe group
    
    it 'should detach from its parent group', ->
      group = new Group(0, 0)
      group.adopt(node)
      expect(node.parent).toBe group
      
      node.detach()
      
      expect(node.parent?).toBe false
  
  describe 'ancestry traversal', ->
    world = group1 = group2 = group3 = group4 = null
    
    beforeEach ->
      node.x = 16
      node.y = 8
      world = new Group(0, 0)
      group1 = new Group(100, 100, world)
      group2 = new Group(200, -500, group1)
      group3 = new Group(300, 200, group2)
      group4 = new Group(400, 0, group3)
      group4.adopt(node)
    
    it 'should traverse from `node.parent` to the tree root', ->
      parents = []
      node.iterateUpToRoot (anc) -> parents.push anc
      
      expect(parents).toEqual [group4, group3, group2, group1, world]
    
    it 'should traverse from the tree root to `node.parent`', ->
      parents = []
      node.iterateDownFromRoot (anc) -> parents.push anc
      
      expect(parents).toEqual [world, group1, group2, group3, group4]
    
    it 'should traverse from the given node to `node.parent`', ->
      parents = []
      node.iterateDownFrom group2, (anc) -> parents.push anc
      
      expect(parents).toEqual [group2, group3, group4]
    
    it 'should not traverse if the given node is not an ancestor', ->
      group0 = new Group(0, 0)
      fn = -> node.iterateDownFrom group0, (anc) -> true
      
      expect(fn).toThrow()
    
    it 'should abort traversal early if the function returns `false`', ->
      parents = []; i = 0
      node.iterateUpToRoot (anc) ->
        return false if ++i > 2
        parents.push anc
      
      expect(parents).toEqual [group4, group3]
      
      parents = []; i = 0
      node.iterateDownFromRoot (anc) ->
        return false if ++i > 2
        parents.push anc
      
      expect(parents).toEqual [world, group1]
      
      parents = []; i = 0
      node.iterateDownFrom group1, (anc) ->
        return false if ++i > 2
        parents.push anc
      
      expect(parents).toEqual [group1, group2]
  
  describe 'tree ascent', ->
    
    world = group1 = group2 = group3 = null
    
    beforeEach ->
      node.x = 16
      node.y = 8
      world = new Group(0, 0)
      group1 = new Group(100, 100, world)
      group2 = new Group(200, -500, group1)
      group3 = new Group(300, 200, group2)
      group3.adopt(node)
    
    it 'should lift to its highest ancestor, maintaining a relative position', ->
      world.x = 20
      world.y = -10
      
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(group3.children).toContain node
      expect(node.parent).toBe group3
      
      node.lift()
      
      expect(group3.children).not.toContain node
      expect(world.children).toContain node
      expect(node.parent).toBe world
      expect({x: node.x, y: node.y}).toEqual { x: 616, y: -192 }
    
    it 'should lift the node completely out of the tree, maintaining a relative position', ->
      world.x = 20
      world.y = -10
      
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(group3.children).toContain node
      expect(node.parent).toBe group3
      
      node.liftOut()
      
      expect(group3.children).not.toContain node
      expect(node.parent?).toBe false
      expect({x: node.x, y: node.y}).toEqual { x: 636, y: -202 }
    
    it 'should lift the node to the specified ancestor, maintaining a relative position', ->
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(group3.children).toContain node
      expect(node.parent).toBe group3
      
      node.liftTo(group1)
      
      expect(group3.children).not.toContain node
      expect(group1.children).toContain node
      expect(node.parent).toBe group1
      expect({x: node.x, y: node.y}).toEqual { x: 516, y: -292 }
  
  describe 'tree descent', ->
    
    world = group1 = group2 = group3 = null
    
    beforeEach ->
      node.x = 16
      node.y = 8
      world = new Group(0, 0)
      group1 = new Group(100, 100, world)
      group2 = new Group(200, -500, group1)
      group3 = new Group(300, 200, group2)
      group1.adopt(node)
    
    it 'should drop into the specified descendant group, maintaining a relative position', ->
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(group1.children).toContain node
      expect(node.parent).toBe group1
      
      node.dropInto group3
      
      expect(group1.children).not.toContain node
      expect(group3.children).toContain node
      expect(node.parent).toBe group3
      expect({x: node.x, y: node.y}).toEqual { x: -484, y: 308 }
    
  describe 'tree repositioning', ->
    
    world = null
    groupA1 = groupA2 = groupA3 = null
    groupB1 = groupB2 = groupB3 = groupB4 = null
    groupOutsider = null
    
    beforeEach ->
      node.x = 16
      node.y = 8
      world = new Group(0, 0)
      
      groupA1 = new Group(100, 100, world)
      groupA2 = new Group(200, -500, groupA1)
      groupA3 = new Group(300, 200, groupA2)
      
      groupB1 = new Group(50, 100, world)
      groupB2 = new Group(-40, 200, groupB1)
      groupB3 = new Group(250, 300, groupB2)
      groupB4 = new Group(-100, 400, groupB3)
      
      groupOutsider = new Group(0, 0)
      
      groupA3.adopt(node)
    
    it 'should jump to another group in the same tree', ->
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(groupA3.children).toContain node
      expect(node.parent).toBe groupA3
      
      node.jumpInto groupB4
      
      expect(groupA3.children).not.toContain node
      expect(groupB4.children).toContain node
      expect(node.parent).toBe groupB4
      expect({x: node.x, y: node.y}).toEqual { x: 456, y: -1192 }
    
    it 'should throw if there is no common ancestor', ->
      fn = -> node.jumpInto groupOutsider
      expect(fn).toThrow()
    
    it 'should not alter the node\'s position if there is no common ancestor', ->
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(groupA3.children).toContain node
      expect(node.parent).toBe groupA3
      
      fn = -> node.jumpInto groupOutsider
      expect(fn).toThrow()
      
      expect({x: node.x, y: node.y}).toEqual { x: 16, y: 8 }
      expect(groupA3.children).toContain node
      expect(node.parent).toBe groupA3