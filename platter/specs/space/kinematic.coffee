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

`import Vector, { SimpleVector, ImmutableVector } from 'platter/math/vector'`

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
    
    it 'should unset the `_instanceData` when released', ->
      aabb = AABB.define().dimensions(8, 16).create()
      kinematic.adopt(aabb).setBody(aabb)
      
      expect(kinematic.body?).toBe true
      expect(kinematic.delta?).toBe true
      
      fn = -> kinematic.release()
      
      # `aabb` is still a child.  It should throw here.
      expect(fn).toThrow()
      
      expect(kinematic.body?).toBe true
      expect(kinematic.delta?).toBe true
      
      kinematic.body = null
      kinematic.orphan(aabb)
      
      expect(fn).not.toThrow()
      
      expect(kinematic.body?).toBe false
      expect(kinematic.delta?).toBe false
    
    describe 'children', ->
    
      it 'should not accept groups as children', ->
        group = Group.create(0, 0)
        
        fn = -> kinematic.adopt(group)
        
        expect(fn).toThrow()
      
      it 'should accept only `point`, `circle`, and `AABB` nodes as children', ->
        point = Point.create()
        circle = Circle.define().radius(5).create()
        aabb = AABB.define().dimensions(5, 10).create()
        
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
    
    describe 'delta vector', ->
      
      it 'should not be settable to `null`', ->
        fn = -> kinematic.delta = null
        
        expect(fn).toThrow()
      
      it 'should retain the same instance when set', ->
        curVector = kinematic.delta
        newVector = new Vector(5, 10)
        
        kinematic.delta = newVector
        
        expect(kinematic.delta).not.toBe newVector
        expect(kinematic.delta).toBe curVector
      
      it 'should be settable with any sort of vector, including literals', ->
        litVector = { x: 8, y: 16 }
        immVector = new ImmutableVector(5, 10)
        simVector = new SimpleVector(3, 6)
        notVector = { dx: 1, dy: 2 }
        
        allowed = [ litVector, immVector, simVector ]
        for v in allowed
          fn = -> kinematic.delta = v
          expect(fn).not.toThrow()
          expect(kinematic.delta.x).toBe v.x
          expect(kinematic.delta.y).toBe v.y
        
        fn = -> kinematic.delta = notVector
        expect(fn).toThrow()
        expect(kinematic.delta.x).not.toBe notVector.dx
        expect(kinematic.delta.y).not.toBe notVector.dy
    
    describe 'body primative', ->
      
      it 'should only allow a body to be a child', ->
        aabb = AABB.define().dimensions(8, 16).create()
        
        fn1 = -> kinematic.body = aabb
        fn2 = -> kinematic.adopt(aabb).body = aabb
        
        expect(fn1).toThrow()
        expect(fn2).not.toThrow()
      
      it 'should only permit AABBs as the body', ->
        
        aabb = AABB.define().dimensions(8, 16).create()
        disallowed = [
          Point.create()
          Circle.define().radius(5).create()
          Line.define().points(0, 0, 1, 1).create()
          Chain.define().add(0, 0).add(1, 1).create()
          Node.create()
        ]
        
        for node in disallowed
          fn = -> kinematic.adopt(node).body = node
          expect(fn).toThrow()
        
        fn = -> kinematic.adopt(aabb).body = aabb
        
        expect(fn).not.toThrow()
      
      it 'should unset the body if it is orphaned', ->
        aabb = AABB.define().dimensions(8, 16).create()
        kinematic.adopt(aabb).body = aabb
        
        expect(kinematic.body).toBe aabb
        
        retVal = kinematic.orphan(aabb)
        
        expect(kinematic.body?).toBe false
        expect(retVal).toBe kinematic
    
    describe 'flipping', ->
      
      it 'should alias `flipX` to `mirror`', ->
        expect(kinematic.flipX).toBe false
        kinematic.mirror = true
        expect(kinematic.flipX).toBe true
      
      it 'should alias `flipY` to `invert`', ->
        expect(kinematic.flipY).toBe false
        kinematic.invert = true
        expect(kinematic.flipY).toBe true