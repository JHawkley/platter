`import Factory from 'platter/factory/base'`
`import World from 'platter/space/world'`
`import { methods as worldMethods } from 'platter/space/world'`
`import Group from 'platter/space/group'`
`import { methods as groupMethods } from 'platter/space/group'`
`import _Node from 'platter/space/node'`

Node = new Factory(_Node)

class Box
  typeGroup = _Node.addType 'test-box'
  constructor: (@x, @y, @width, @height) ->
    @type = typeGroup
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, world', ->
  
  describe 'methods', ->
    
    fWorld = _Node.types['world']
    fGroup = _Node.types['group']
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of groupMethods
        if k not in ['filter', 'allow', 'exclude', 'type']
          expect(World.hasMethod(k, v)).toBe true
        else
          expect(World.hasMethod(k, v)).toBe false
    
    it 'should have methods provided for itself', ->
      for k, v of worldMethods
        expect(World.hasMethod(k, v)).toBe true
    
    describe 'filter', ->
      
      it 'should initialize to allow only groups and seal the filter', ->
        test = {}
        worldMethods.filter.init.call(test)
        
        expect(test.filter.allowed).toBe fGroup
        expect(test.filter.excluded).toBe 0x00000000
        
        expect(Object.isFrozen(test.filter)).toBe false
        worldMethods.filter.seal.call(test)
        expect(Object.isFrozen(test.filter)).toBe true
    
    describe 'position', ->
      
      it 'should provide a means to set the position', ->
        test = {}
        worldMethods.position.init.call(test)
        
        expect(test.x).toBe 0
        expect(test.y).toBe 0
        
        worldMethods.position.apply.call(test, 8, 16)
        
        expect(test.x).toBe 8
        expect(test.y).toBe 16
    
    describe 'dimensions', ->
      
      it 'should provide a means to set the dimensions', ->
        test = {}
        worldMethods.dimensions.apply.call(test, 8, 16)
        
        expect(test.width).toBe 8
        expect(test.height).toBe 16
  
      it 'should not allow zero or less `width` or `height`', ->
        tests = [
          {}
          { width: 0, height: 50 }
          { width: 50, height: 0 }
          { width: -5, height: 5 }
          { width: 5, height:-5 }
        ]
        control = { width: 50, height: 50 }
        
        fns = (-> worldMethods.dimensions.finalize.call(test) for test in tests)
        
        expect(fn).toThrow for fn in fns
        
        fn = -> worldMethods.dimensions.finalize.call(control)
        
        expect(fn).not.toThrow()
    
    describe 'width', ->
      
      it 'should provide a means to set the width', ->
        test = {}
        worldMethods.width.apply.call(test, 8)
        
        expect(test.width).toBe 8
    
    describe 'height', ->
      
      it 'should provide a means to set the height', ->
        test = {}
        worldMethods.height.apply.call(test, 16)
        
        expect(test.height).toBe 16
    
    describe 'type', ->
      
      it 'should set a type of `group` and `world`', ->
        test = {}
        worldMethods.type.finalize.call(test)
        expect(test.type).toBe(fGroup | fWorld)
  
  describe 'implementation', ->
  
    world = null
    beforeEach -> world = World.define().dimensions(4000, 240).create()
    
    it 'should extend `Group`', ->
      expect(world instanceof Group.ctor).toBe true
    
    it 'should have a nodeType of `world` & `group`', ->
      grp = !!(world.type & _Node.types['group'])
      wld = !!(world.type & _Node.types['world'])
      expect(grp and wld).toBe true
    
    it 'should override `toString()`', ->
      matcher = toStringHelper('Platter.space.World#', '({x: 0, y: 0, width: 4000, height: 240})')
      expect(world.toString()).toMatch matcher
    
    describe 'time', ->
      
      it 'should run a time step', ->
        expect(world.time).toBe 0
        world.step(0.33)
        expect(world.time).toBe 0.33
          
      it 'should run several time steps', ->
        expect(world.time).toBe 0
        world.step(0.25)
        world.step(0.25)
        world.step(0.25)
        world.step(0.25)
        expect(world.time).toBe 1
    
    describe 'place in the graph', ->
      
      it 'should not be able to have a parent', ->
        group = Group.create()
        fn = -> world.parent = group
        
        expect(fn).toThrow()
      
      it 'should not be able to be adopted', ->
        group = Group.create()
        fn = -> world.wasAdoptedBy(group)
        
        expect(fn).toThrow()
      
      it 'should only accept groups as children', ->
        node = Node.create(0, 0)    # No type at all.
        box = new Box(0, 0)         # Type is test-box.
        group = Group.create(0, 0)  # Type is group.
        
        fn1 = -> world.adopt(node)
        fn2 = -> world.adopt(box)
        fn3 = -> world.adopt(group)
        
        expect(fn1).toThrow()
        expect(fn2).toThrow()
        expect(fn3).not.toThrow()
    
    describe 'rectangles & `toRect()`', ->
      
      it 'should implement the `toRect()` interface', ->
        expected = { x: 0, y: 0, width: 4000, height: 240 }
        rect = world.toRect()
        for prop, val of expected
          expect(rect[prop]).toBe val
      
      it 'should be able to provide a rectangle representing the content bounds', ->
        group = Group.create(8, 16)
        child1 = new Box(12, 6, 20, 10)
        child2 = new Box(82, 17, 8, 8)
        group.adopt(child1, child2)
        expected = { x: 20, y: 22, width: 78, height: 19 }
        
        world.adopt(group)
        rect = world.contentAsRect()
        for prop, val of expected
          expect(rect[prop]).toBe val