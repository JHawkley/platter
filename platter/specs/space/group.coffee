`import Factory from 'platter/factory/base'`
`import Group from 'platter/space/group'`
`import { methods as groupMethods } from 'platter/space/group'`
`import Node from 'platter/space/node'`
`import { forUsing } from 'platter/utils/es6'`

class Box
  typeGroup = Node.addType 'test-box'
  constructor: (@x, @y, @width, @height) ->
    @type = typeGroup
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, group', ->
  
  group = null
  
  it 'should extend Node', ->
    expect(Group.create() instanceof Node).toBe true
  
  describe 'methods', ->
    fBox = Node.types['test-box']
    fGroup = Node.types['group']
    
    it 'should have methods provided for itself', ->
      for k, v of groupMethods
        expect(Group.hasMethod(k, v)).toBe true
    
    describe 'filter', ->
      
      it 'should initialize and seal the filter object', ->
        test = {}
        groupMethods.filter.init.call(test)
        
        expect(test.filter.allowed).toBe 0x00000000
        expect(test.filter.excluded).toBe 0x00000000
        
        expect(Object.isFrozen(test.filter)).toBe false
        groupMethods.filter.seal.call(test)
        expect(Object.isFrozen(test.filter)).toBe true
    
    describe 'allow', ->
      
      it 'should add a type to the allowed filter', ->
        test = { filter: { allowed: 0x00000000 } }
        
        groupMethods.allow.apply.call(test, fBox)
        
        expect(test.filter.allowed).toBe fBox
        
        groupMethods.allow.apply.call(test, fGroup)
        
        expect(test.filter.allowed).toBe(fBox | fGroup)
      
      it 'should allow all if no types are specified', ->
        test = { filter: { allowed: 0x00000000 } }
        
        groupMethods.allow.finalize.call(test)
        
        expect(test.filter.allowed).toBe(~0x00000000 >>> 0)
      
      it 'should make no changes if a type is specified', ->
        test = { filter: { allowed: fBox } }
        
        groupMethods.allow.finalize.call(test)
        
        expect(test.filter.allowed).toBe fBox
    
    describe 'exclude', ->
      
      it 'should add a type to the excluded filter', ->
        test = { filter: { excluded: 0x00000000 } }
        
        groupMethods.exclude.apply.call(test, fBox)
        
        expect(test.filter.excluded).toBe fBox
        
        groupMethods.exclude.apply.call(test, fGroup)
        
        expect(test.filter.excluded).toBe(fBox | fGroup)
    
    describe 'type', ->
      
      it 'should set a type of `group`', ->
        test = {}
        groupMethods.type.finalize.call(test)
        expect(test.type).toBe(Node.types['group'])
  
  describe 'implementation', ->
    
    it 'should override `toString()`', ->
      matcher = toStringHelper('Platter.space.Group#', '({x: 40, y: 10})')
      expect(Group.create(40, 10).toString()).toMatch matcher
    
    describe 'adding children', ->
      
      beforeEach -> group = Group.create(0, 0)
      
      it 'should adopt child objects and groups', ->
        child1 = new Box(12, 6, 20, 10)
        child2 = new Box(82, 6, 8, 8)
        childGroup = Group.create(40, 10)
        
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
        childGroup = Group.create(40, 10)
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
      fBox = Node.types['test-box']
      fGroup = Node.types['group']
      child1 = child2 = childGroup = null
      
      beforeEach ->
        child1 = new Box(12, 6, 20, 10)
        child2 = new Box(82, 17, 8, 8)
        childGroup = Group.create(98, 78)
        
      describe 'by explicitly allowing specific node types', ->
      
        it 'should not adopt objects that are not specifically allowed', ->
          group = Group.define().allow(fBox).create(0, 0)
          
          fn1 = -> group.adopt(child1, child2)
          fn2 = -> group.adopt(childGroup)
          
          expect(fn1).not.toThrow()
          expect(fn2).toThrow()
        
        it 'should adopt all objects if `allow` method is never used', ->
          group = Group.define().create(0, 0)
          
          fn1 = -> group.adopt(child1, child2)
          fn2 = -> group.adopt(childGroup)
          
          expect(fn1).not.toThrow()
          expect(fn2).not.toThrow()
      
      describe 'by explicitly excluding specific node types', ->
        
        it 'should not adopt objects that are not specifically allowed', ->
          group = Group.define().exclude(fBox).create(0, 0)
          
          fn1 = -> group.adopt(child1, child2)
          fn2 = -> group.adopt(childGroup)
          
          expect(fn1).toThrow()
          expect(fn2).not.toThrow()
        
        it 'should give priority to exclusion', ->
          group = Group.define().allow(fBox).exclude(fBox).create(0, 0)
          
          fn1 = -> group.adopt(child1, child2)
          fn2 = -> group.adopt(childGroup)
          
          expect(fn1).toThrow()
          expect(fn2).toThrow()
    
    describe 'removing children', ->
      
      child1 = child2 = childGroup = otherChildren = null
      
      beforeEach ->
        group = Group.create(0, 0)
        child1 = new Box(12, 6, 20, 10)
        child2 = new Box(82, 6, 8, 8)
        childGroup = Group.create(40, 10)
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
        group = Group.create(0, 0)
        child1 = new Box(12, 6, 20, 10)
        child2 = new Box(82, 6, 8, 8)
        child3 = new Box(50, 13, 8, 8)
        child4 = new Box(43, 6, 16, 8)
        childGroup = Group.create(40, 10)
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
      
      beforeEach -> group = Group.create(30, 40)
      
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
        childGroup = Group.create(98, 78)
        expected = { x: 42, y: 46, width: 78, height: 19 }
        
        group.adopt(child1, child2, childGroup)
        rect = group.toRect()
        for prop, val of expected
          expect(rect[prop]).toBe val