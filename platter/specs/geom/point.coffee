`import Point from 'platter/geom/point'`
`import { methods as pointMethods } from 'platter/geom/point'`
`import { point as tPoint } from 'platter/geom/_type'`
`import Primative from 'platter/geom/primative'`
`import { methods as nodeMethods } from 'platter/space/node'`
`import { methods as primativeMethods } from 'platter/geom/primative'`
`import Vector from 'platter/math/vector'`
`import Rect from 'platter/math/rect'`

describe 'platter: geometry, point', ->
  
  it 'should extend `Primative`', ->
    expect(Point.create() instanceof Primative).toBe true
  
  describe 'methods', ->
  
    it 'should have methods provided by Node', ->
      for k, v of nodeMethods
        expect(Point.hasMethod(k, v)).toBe true
  
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(Point.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of pointMethods
        expect(Point.hasMethod(k, v)).toBe true
    
    describe 'rectangle', ->
    
      it 'should provide an appropriate rectangle', ->
        test = { x: 8, y: 16 }
        pointMethods.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 8, y: 16, width: 0, height: 0 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        pointMethods.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
    
    describe 'typeGroup', ->
    
      it 'should set a type of `circle`', ->
        test = { type: [] }
        pointMethods.typeGroup.finalize.call(test)
        
        expect(test.type).toContain tPoint
  
  describe 'implementation', ->
  
    it 'should override `toString()`', ->
      instance = Point.define().translate(30, 20).create()
      matcher = toStringHelper('Platter.geom.Point#', '({x: 30, y: 20})')
      expect(instance.toString()).toMatch matcher
    
    it 'should implement the `support()` interface', ->
      point = Point.define().translate(13, 20).create()
      pt = point.support(Vector.create(), Vector.create(2, -1))
      expect(pt.x).toBe 13
      expect(pt.y).toBe 20
      
      pt = point.support(Vector.create(), Vector.create(2, 2))
      expect(pt.x).toBe 13
      expect(pt.y).toBe 20
      
      pt = point.support(Vector.create(), Vector.create(3, -1))
      expect(pt.x).toBe 13
      expect(pt.y).toBe 20
    
    it 'should implement the `centerOf()` interface', ->
      point = Point.define().translate(13, 20).create()
      pt = point.centerOf(Vector.create())
      
      expect(pt.x).toBe 13
      expect(pt.y).toBe 20
    
    it 'should implement the `makeProxy()` interface', ->
      point = Point.define().translate(13, 20).create()
      fn = -> proxy = point.makeProxy()
      
      expect(fn).not.toThrow()
    
    it 'should implement the `toRect()` interface', ->
      point = Point.define().translate(13, 20).create()
      rect = point.toRect(Rect.create())
      expectation = { x: 13, y: 20, width: 0, height: 0 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return