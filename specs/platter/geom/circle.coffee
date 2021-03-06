`import Circle, { Methods as methCircle, Type as tCircle } from 'platter/geom/circle'`
`import { Primative, Methods as methPrimative } from 'platter/geom/primative'`
`import { Methods as methNode } from 'platter/space/node'`
`import { MutableVector as Vector } from 'platter/math/vector'`
`import Rect from 'platter/math/rect'`

describe 'platter: geometry, circle', ->
  
  it 'should extend `Primative`', ->
    expect(Circle.define().radius(4).create() instanceof Primative).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of methNode
        expect(Circle.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Primative', ->
      for k, v of methPrimative
        expect(Circle.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of methCircle
        expect(Circle.hasMethod(k, v)).toBe true
    
    describe 'radius', ->
    
      it 'should provide a means of setting the radius', ->
        test = {}
        methCircle.radius.apply.call(test, 8)
        
        expect(test.radius).toBe 8
    
    describe 'rectangle', ->
    
      it 'should provide appropriate dimensions', ->
        test = { x: 8, y: 16, radius: 4 }
        methCircle.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 4, y: 12, width: 8, height: 8 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        methCircle.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
      
      it 'should fail to provide a rectangle if radius isn\'t set', ->
        test = { x: 8, y: 16 }
        fn = -> methCircle.rectangle.finalize.call(test)
        
        expect(fn).toThrow()
    
    describe 'setType', ->
    
      it 'should set a type of `circle`', ->
        test = { type: [] }
        methCircle.setType.finalize.call(test)
        
        expect(test.type).toContain tCircle
  
  describe 'implementation', ->

    xit 'should implement the `proxy` interface', ->
      circle = Circle.define().translate(13, 20).radius(5).create()
      proxy = circle.proxy
      
      expect(proxy).toEqual jasmine.anything()
    
    it 'should implement the `support()` interface', ->
      x = 13; y = 20; r = 5
      
      circle = Circle.define().translate(x, y).radius(r).create()
      
      testVectors = [
        Vector.create(0, -1)  # N
        Vector.create(1, 0)   # E
        Vector.create(0, 1)   # S
        Vector.create(-1, 0)   # W
      ].map (v) -> v.mulEq(0.2)
      
      expectations = [
        { x, y: y - r }
        { x: x + r, y }
        { x, y: y + r }
        { x: x - r, y }
      ]
      
      for v, i in testVectors
        pt = circle.support(Vector.create(), v)
        expect(pt.x).toBe expectations[i].x
        expect(pt.y).toBe expectations[i].y
    
    it 'should implement the `centerOf()` interface', ->
      circle = Circle.define().translate(13, 20).radius(5).create()
      pt = circle.centerOf(Vector.create())
      
      expect(pt.x).toBe 13
      expect(pt.y).toBe 20
    
    it 'should implement the `toRect()` interface', ->
      circle = Circle.define().translate(13, 20).radius(5).create()
      rect = circle.toRect(Rect.create())
      expectation = { x: 8, y: 15, width: 10, height: 10 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return
    
    it 'should be immutable', ->
      circle = Circle.define().translate(13, 20).radius(5).create()
      fn = -> circle.radius = 40
      
      expect(fn).toThrow()
      expect(circle.radius).not.toBe(40)