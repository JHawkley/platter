`import Factory from 'platter/factory/base'`
`import Kinematic from 'platter/space/kinematic'`
`import { kinematic as tKinematic } from 'platter/space/_type'`
`import { methods as kinematicMethods } from 'platter/space/kinematic'`
`import _Node, {methods as nodeMethods } from 'platter/space/node'`
`import CallbackType from 'platter/callback/type'`
`import CallbackOptions from 'platter/callback/options'`
`import Group from 'platter/space/group'`
`import { group as tGroup } from 'platter/space/_type'`
`import { methods as groupMethods } from 'platter/space/group'`

`import Point from 'platter/geom/point'`
`import { point as tPoint } from 'platter/geom/_type'`
`import Circle from 'platter/geom/circle'`
`import { circle as tCircle } from 'platter/geom/_type'`
`import AABB from 'platter/geom/aabb'`
`import { aabb as tAABB } from 'platter/geom/_type'`

`import Line from 'platter/geom/line'`
`import Chain from 'platter/geom/chain'`

`import Vector, { ImmutableVector } from 'platter/math/vector'`

Node = new Factory(_Node)
tTestBox = CallbackType.add 'test-box'
allowedPrimatives = [tPoint, tCircle, tAABB]

class Box
  constructor: (@x, @y, @width, @height) ->
    @type = tTestBox
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, kinematic', ->
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of nodeMethods
        expect(Kinematic.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of groupMethods
        if k not in ['filter', 'include', 'typeGroup']
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
        
        for tPrim in allowedPrimatives
          expect(test.filter.included).toContain tPrim
        expect(test.filter.excluded).toContain tGroup
        
        kinematicMethods.filter.seal.call(test)
        expect(test.filter instanceof CallbackOptions).toBe true
        expect(test.filter.isSealed).toBe true
        
        expect(test.filter.included).toBe(tPoint.value | tCircle.value | tAABB.value)
        expect(test.filter.excluded).toBe tGroup.value
    
    describe 'typeGroup', ->
      
      it 'should set a type of `group` and `kinematic`', ->
        test = { type: [] }
        kinematicMethods.typeGroup.finalize.call(test)
        expect(test.type).toContain tGroup
        expect(test.type).toContain tKinematic
  
  describe 'implementation', ->
  
    kinematic = null
    beforeEach -> kinematic = Kinematic.create(0, 0)
    
    it 'should extend `Group`', ->
      expect(kinematic instanceof Group.ctor).toBe true
    
    it 'should have a nodeType of `kinematic` & `group`', ->
      grp = tGroup.test(kinematic.type)
      kin = tKinematic.test(kinematic.type)
      expect(grp and kin).toBe true
    
    it 'should override `toString()`', ->
        matcher = toStringHelper('Platter.space.Kinematic#', '({x: 40, y: 10})')
        expect(Kinematic.create(40, 10).toString()).toMatch matcher
    
    it 'should reset the `_instanceData` when released', ->
      aabb = AABB.define().dimensions(8, 16).create()
      kinematic.adopt(aabb).setBody(aabb)
      kinematic.delta.set(Vector.create(6, 6))
      
      expect(kinematic.body?).toBe true
      expect(kinematic.delta.nodes.length).toBe 1
      
      fn = -> kinematic.release()
      
      # `aabb` is still a child.  It should throw here.
      expect(fn).toThrow()
      
      expect(kinematic.body?).toBe true
      expect(kinematic.delta.nodes.length).toBe 1
      
      kinematic.body = null
      kinematic.orphan(aabb)
      
      expect(fn).not.toThrow()
      
      expect(kinematic.body?).toBe false
      expect(kinematic.delta.nodes.length).toBe 0
    
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
    
    describe 'delta vector interpolation', ->
      
      it 'should not be settable', ->
        fn = -> kinematic.delta = null
        
        expect(fn).toThrow()
    
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