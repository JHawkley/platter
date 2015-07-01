`import Factory from 'platter/factory/base'`
`import Dynamic from 'platter/space/dynamic'`
`import { methods as dynamicMethods } from 'platter/space/dynamic'`
`import _Node from 'platter/space/node'`
`import Group from 'platter/space/group'`
`import { methods as groupMethods } from 'platter/space/group'`
`import Kinematic from 'platter/space/kinematic'`

Node = new Factory(_Node)

class Box
  typeGroup = _Node.addType 'test-box'
  constructor: (@x, @y, @width, @height) ->
    @type = typeGroup
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, dynamic', ->
  
  describe 'methods', ->
    
    fDynamic = _Node.types['dynamic']
    fGroup = _Node.types['group']
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of groupMethods
        if k not in ['filter', 'type']
          expect(Dynamic.hasMethod(k, v)).toBe true
        else
          expect(Dynamic.hasMethod(k, v)).toBe false
        
    it 'should have methods provided for itself', ->
      for k, v of dynamicMethods
        expect(Dynamic.hasMethod(k, v)).toBe true
    
    describe 'filter', ->
      
      it 'should initialize to exclude groups and seal the filter', ->
        test = {}
        dynamicMethods.filter.init.call(test)
        
        expect(test.filter.allowed).toBe 0x00000000
        expect(test.filter.excluded).toBe fGroup
        
        expect(Object.isFrozen(test.filter)).toBe false
        dynamicMethods.filter.seal.call(test)
        expect(Object.isFrozen(test.filter)).toBe true
    
    describe 'type', ->
      
      it 'should set a type of `group` and `dynamic`', ->
        test = {}
        dynamicMethods.type.finalize.call(test)
        expect(test.type).toBe(fGroup | fDynamic)
  
  describe 'implementation', ->
  
    dynamic = null
    beforeEach -> dynamic = Dynamic.create(0, 0)
    
    it 'should extend `Group`', ->
      expect(dynamic instanceof Group.ctor).toBe true
    
    it 'should have a nodeType of `dynamic` & `group`', ->
      grp = !!(dynamic.type & _Node.types['group'])
      dyn = !!(dynamic.type & _Node.types['dynamic'])
      expect(grp and dyn).toBe true
    
    it 'should override `toString()`', ->
      matcher = toStringHelper('Platter.space.Dynamic#', '({x: 40, y: 10})')
      expect(Dynamic.create(40, 10).toString()).toMatch matcher
    
    it 'should not accept groups as children', ->
      node = Node.create(0, 0)      # No type at all.
      box = new Box(0, 0, 10, 10)   # Type is test-box.
      group = Group.create(0, 0)    # Type is group.
      
      fn1 = -> dynamic.adopt(node)
      fn2 = -> dynamic.adopt(box)
      fn3 = -> dynamic.adopt(group)
      
      expect(fn1).not.toThrow()
      expect(fn2).not.toThrow()
      expect(fn3).toThrow()
    
    it 'should accept Kinematics as children, as a special exception', ->
      kinematic = Kinematic.create()
      
      fn = -> dynamic.adopt(kinematic)
      
      expect(fn).not.toThrow()