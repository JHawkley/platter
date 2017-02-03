`import Factory from 'platter/factory/base'`
`import Kinematic, { Methods as methKinematic, Type as tKinematic } from 'platter/space/kinematic'`
`import { Node as _Node, Methods as methNode, TypeMethod } from 'platter/space/node'`
`import CallbackType from 'platter/callback/type'`
`import CallbackOptions from 'platter/callback/options'`
`import Group, { Group as _Group, Methods as methGroup, Type as tGroup } from 'platter/space/group'`
`import { MutableVector as Vector, ImmutableVector } from 'platter/math/vector'`

Node = Factory.from((class extends _Node), TypeMethod)
tTestBox = CallbackType.add 'test-box'

class Box
  constructor: (@x, @y, @width, @height) ->
    @type = tTestBox
  wasAdoptedBy: () -> return
  wasOrphanedBy: () -> return
  toRect: (out) -> out.set(this); return out
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, kinematic', ->
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of methNode
        expect(Kinematic.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of methGroup
        if k not in ['filter', 'setType']
          expect(Kinematic.hasMethod(k, v)).toBe true
        else
          expect(Kinematic.hasMethod(k, v)).toBe false
        
    it 'should have methods provided for itself', ->
      for k, v of methKinematic
        expect(Kinematic.hasMethod(k, v)).toBe true
    
    describe 'filter', ->
      
      it 'should initialize to exclude groups and seal the filter', ->
        test = {}
        methKinematic.filter.init.call(test)
        
        expect(test.filter.included).toEqual []
        expect(test.filter.excluded).toContain tGroup
        
        methKinematic.filter.seal.call(test)
        expect(test.filter instanceof CallbackOptions).toBe true
        expect(test.filter.isSealed).toBe true
        
        expect(test.filter.included).toBe 0x00000000
        expect(test.filter.excluded).toBe tGroup.value
    
    describe 'setType', ->
      
      it 'should set a type of `group` and `kinematic`', ->
        test = { type: [] }
        methKinematic.setType.finalize.call(test)
        expect(test.type).toContain tGroup
        expect(test.type).toContain tKinematic
  
  describe 'implementation', ->
  
    kinematic = null
    beforeEach -> kinematic = Kinematic.create(0, 0)
    
    it 'should extend `Group`', ->
      expect(kinematic instanceof _Group).toBe true
    
    it 'should have a node type of `kinematic` & `group`', ->
      grp = tGroup.test(kinematic.type)
      dyn = tKinematic.test(kinematic.type)
      expect(grp and dyn).toBe true
    
    describe 'children', ->
    
      it 'should not accept groups as children', ->
        node = Node.create(0, 0)      # No type at all.
        box = new Box(0, 0, 10, 10)   # Type is test-box.
        group = Group.create(0, 0)    # Type is group.
        
        fn1 = -> kinematic.adopt(node)
        fn2 = -> kinematic.adopt(box)
        fn3 = -> kinematic.adopt(group)
        
        expect(fn1).not.toThrow()
        expect(fn2).not.toThrow()
        expect(fn3).toThrow()
    
    describe 'delta vector interpolation', ->
      
      it 'should not be settable', ->
        fn = -> kinematic.delta = null
        
        expect(fn).toThrow()