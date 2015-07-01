`import _Group from 'platter/space/group'`
`import Node from 'platter/space/node'`
`import { forUsing } from 'platter/utils/es6'`

class Group extends _Group
  constructor: -> _Group.init(this, arguments...)

class Box
  constructor: (@x, @y, @width, @height) ->
    @type = Node.addType 'test-box'
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, group', ->
  
  group = null
  
  it 'should not be directly instantiable with `new`', ->
    fn = -> new _Node(0, 0)
    expect(fn).toThrow()
  
  it 'should extend Node', ->
    expect(new Group() instanceof Node).toBe true
    
  it 'should have a nodeType of `group`', ->
    grp = !!(new Group().type & Node.types['group'])
    expect(grp).toBe true
  
  it 'should override `toString()`', ->
    str = 'Platter.space.Group({x: 40, y: 10})'
    expect(new Group(40, 10).toString()).toBe str
  
  describe 'adding children', ->
    
    beforeEach -> group = new Group(0, 0)
    
    it 'should adopt child objects and groups', ->
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 6, 8, 8)
      childGroup = new Group(40, 10)
      
      expect(group.children.length).toBe 0
      group.adopt(child1)
      expect(group.children).toContain child1
      group.adopt(child2)
      expect(group.children).toContain child2
      group.adopt(childGroup)
      expect(group.children).toContain childGroup
      expect(group.children.length).toBe 3
  
    it 'should adopt multiple children with one call to `adopt()`', ->
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 6, 8, 8)
      childGroup = new Group(40, 10)
      otherChildren = [
        new Box(50, 13, 8, 8)
        new Box(43, 6, 16, 8)
      ]
      
      allChildren = [child1, child2, childGroup, otherChildren[0], otherChildren[1]]
      
      expect(group.children.length).toBe 0
      group.adopt(child1, child2, childGroup, otherChildren...)
      for child in allChildren
        expect(group.children).toContain child
    
    it 'should call `wasAdoptedBy()` on the child when adopted', ->
      child1 = new Box(12, 6, 20, 10)
      child1.wasAdoptedBy = jasmine.createSpy('wasAdoptedBy')
      group.adopt(child1)
      
      expect(child1.wasAdoptedBy).toHaveBeenCalledWith(group)
      
    it 'should not adopt itself as a child', ->
      fn = -> group.adopt(group)
      
      expect(fn).toThrow()
  
  describe 'exclusion of children', ->
    child1 = child2 = childGroup = null
    
    beforeEach ->
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 17, 8, 8)
      childGroup = new Group(98, 78)
    
    it 'should not adopt objects that are filtered (test-box)', ->
      group = new Group(0, 0, Node.types['test-box'])
      
      fn1 = -> group.adopt(child1, child2)
      fn2 = -> group.adopt(childGroup)
      
      expect(fn1).toThrow()
      expect(fn2).not.toThrow()
    
    it 'should not adopt objects that are filtered (group)', ->
      group = new Group(0, 0, Node.types['group'])
      
      fn1 = -> group.adopt(child1, child2)
      fn2 = -> group.adopt(childGroup)
      
      expect(fn1).not.toThrow()
      expect(fn2).toThrow()
  
  describe 'removing children', ->
    
    child1 = child2 = childGroup = otherChildren = null
    
    beforeEach ->
      group = new Group(0, 0)
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 6, 8, 8)
      childGroup = new Group(40, 10)
      otherChildren = [
        new Box(50, 13, 8, 8)
        new Box(43, 6, 16, 8)
      ]
      group.adopt(child1, child2, childGroup, otherChildren...)
    
    it 'should orphan a child', ->
      expect(group.children.length).toBe 5
      expect(group.children).toContain child2
      
      group.orphan(child2)
      
      expect(group.children).not.toContain child2
      expect(group.children.length).toBe 4
    
    it 'should orphan multiple children with one call to `orphan()`', ->
      expect(group.children.length).toBe 5
      expect(group.children).toContain child1
      expect(group.children).toContain otherChildren[0]
      expect(group.children).toContain otherChildren[1]
      
      group.orphan(child1, otherChildren...)
      
      expect(group.children).not.toContain child1
      expect(group.children).not.toContain otherChildren[0]
      expect(group.children).not.toContain otherChildren[1]
      expect(group.children.length).toBe 2
    
    it 'should call `wasOrphanedBy()` on the child when orphaned', ->
      child1.wasOrphanedBy = jasmine.createSpy('wasOrphanedBy')
      group.orphan(child1)
      
      expect(child1.wasOrphanedBy).toHaveBeenCalledWith(group)
  
  describe 'es6-compatible iterator', ->
    
    child1 = child2 = child3 = child4 = childGroup = null
    
    beforeEach ->
      group = new Group(0, 0)
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 6, 8, 8)
      child3 = new Box(50, 13, 8, 8)
      child4 = new Box(43, 6, 16, 8)
      childGroup = new Group(40, 10)
      childGroup.adopt(child3, child4)
      group.adopt(child1, child2, childGroup)
    
    it 'should iterate over leaves in the tree', ->
      results = []
      forUsing group, (val) -> results.push val
      
      expect(results).toContain child1
      expect(results).toContain child2
      expect(results).toContain child3
      expect(results).toContain child4
      expect(results).not.toContain childGroup
      expect(results).not.toContain group
  
  describe 'rectangles & `toRect()`', ->
    
    beforeEach -> group = new Group(30, 40)
    
    it 'should return a 0 width/height rectangle if empty', ->
      expected = { x: 30, y: 40, width: 0, height: 0 }
      expect(group.children.length).toBe 0
      rect = group.toRect()
      for prop, val of expected
        expect(rect[prop]).toBe val
  
    it 'should encapsulate its children in the output rectangle', ->
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 17, 8, 8)
      expected = { x: 42, y: 46, width: 78, height: 19 }
      
      group.adopt(child1, child2)
      rect = group.toRect()
      for prop, val of expected
        expect(rect[prop]).toBe val
    
    it 'should not include empty groups in the output rectangle', ->
      child1 = new Box(12, 6, 20, 10)
      child2 = new Box(82, 17, 8, 8)
      childGroup = new Group(98, 78)
      expected = { x: 42, y: 46, width: 78, height: 19 }
      
      group.adopt(child1, child2, childGroup)
      rect = group.toRect()
      for prop, val of expected
        expect(rect[prop]).toBe val