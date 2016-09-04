`import Point, { Methods as methPoint, Type as tPoint } from 'platter/geom/point'`
`import { Primative, Methods as methPrimative } from 'platter/geom/primative'`
`import { Methods as methNode } from 'platter/space/node'`
`import { MutableVector as Vector } from 'platter/math/vector'`
`import Rect from 'platter/math/rect'`

describe 'platter: geometry, point', ->
  
  it 'should extend `Primative`', ->
    expect(Point.create() instanceof Primative).toBe true
  
  describe 'methods', ->
  
    it 'should have methods provided by Node', ->
      for k, v of methNode
        expect(Point.hasMethod(k, v)).toBe true
  
    it 'should have methods provided by Primative', ->
      for k, v of methPrimative
        expect(Point.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of methPoint
        expect(Point.hasMethod(k, v)).toBe true
    
    describe 'rectangle', ->
    
      it 'should provide an appropriate rectangle', ->
        test = { x: 8, y: 16 }
        methPoint.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 8, y: 16, width: 0, height: 0 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        methPoint.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
    
    describe 'setType', ->
    
      it 'should set a type of `point`', ->
        test = { type: [] }
        methPoint.setType.finalize.call(test)
        
        expect(test.type).toContain tPoint
  
  describe 'implementation', ->

    xit 'should implement the `proxy` interface', ->
      point = Point.define().translate(13, 20).create()
      proxy = point.proxy
      
      expect(proxy).toEqual jasmine.anything()
    
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
    
    it 'should implement the `toRect()` interface', ->
      point = Point.define().translate(13, 20).create()
      rect = point.toRect(Rect.create())
      expectation = { x: 13, y: 20, width: 0, height: 0 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return