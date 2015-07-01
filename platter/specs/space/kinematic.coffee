`import Factory from 'platter/factory/base'`
`import Kinematic from 'platter/space/kinematic'`
`import { methods as kinematicMethods } from 'platter/space/kinematic'`
`import _Node from 'platter/space/node'`
`import Group from 'platter/space/group'`
`import { methods as groupMethods } from 'platter/space/group'`

`import Point from 'platter/geom/point'`
`import Circle from 'platter/geom/circle'`
`import AABB from 'platter/geom/aabb'`

`import Line from 'platter/geom/line'`
`import Chain from 'platter/geom/chain'`

Node = new Factory(_Node)

class Box
  typeGroup = _Node.addType 'test-box'
  constructor: (@x, @y, @width, @height) ->
    @type = typeGroup
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, kinematic', ->
  
  describe 'methods', ->
    
    fKinematic = _Node.types['kinematic']
    fGroup = _Node.types['group']
    
    fPoint = _Node.types['point']
    fCircle = _Node.types['circle']
    fAABB = _Node.types['aabb']
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of groupMethods
        if k not in ['filter', 'allow', 'type']
          expect(Kinematic.hasMethod(k, v)).toBe true
        else
          expect(Kinematic.hasMethod(k, v)).toBe false
        
    it 'should have methods provided for itself', ->
      for k, v of kinematicMethods
        expect(Kinematic.hasMethod(k, v)).toBe true
    
    describe 'filter', ->
      
      it 'should initialize to allow certain primatives, exclude groups, and seal the filter', ->
        test = {}
        kinematicMethods.filter.init.call(test)
        
        expect(test.filter.allowed).toBe(fPoint | fCircle | fAABB)
        expect(test.filter.excluded).toBe fGroup
        
        expect(Object.isFrozen(test.filter)).toBe false
        kinematicMethods.filter.seal.call(test)
        expect(Object.isFrozen(test.filter)).toBe true
    
    describe 'type', ->
      
      it 'should set a type of `group` and `kinematic`', ->
        test = {}
        kinematicMethods.type.finalize.call(test)
        expect(test.type).toBe(fGroup | fKinematic)
  
  describe 'implementation', ->
  
    kinematic = null
    beforeEach -> kinematic = Kinematic.create(0, 0)
    
    it 'should extend `Group`', ->
      expect(kinematic instanceof Group.ctor).toBe true
    
    it 'should have a nodeType of `kinematic` & `group`', ->
      grp = !!(kinematic.type & _Node.types['group'])
      kin = !!(kinematic.type & _Node.types['kinematic'])
      expect(grp and kin).toBe true
    
    it 'should override `toString()`', ->
        matcher = toStringHelper('Platter.space.Kinematic#', '({x: 40, y: 10})')
        expect(Kinematic.create(40, 10).toString()).toMatch matcher
    
    it 'should not accept groups as children', ->
      group = Group.create(0, 0)
      
      fn = -> kinematic.adopt(group)
      
      expect(fn).toThrow()
    
    it 'should accept only `point`, `circle`, and `AABB` nodes as children', ->
      point = Point.create()
      circle = Circle.define().radius(5).create()
      aabb = AABB.define().dimension(5, 10).create()
      
      line = Line.define().points(0, 0, 1, 1).create()
      chain = Chain.define().add(0, 0).add(1, 1).create()
      typeless = Node.create()
      
      allowed = [point, circle, aabb]
      excluded = [line, chain, typeless]
      
      for node in allowed
        fn = -> kinematic.adopt(node)
        expect(fn).not.toThrow()
      
      for node in excluded
        fn = -> kinematic.adopt(node)
        expect(fn).toThrow()