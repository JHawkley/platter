`import Node from 'platter/space/node'`
`import Point from 'platter/geom/point'`
`import { methods as pointMethods } from 'platter/geom/point'`
`import Primative from 'platter/geom/primative'`
`import { methods as primativeMethods } from 'platter/geom/primative'`

describe 'platter: geometry, point', ->
  
  it 'should extend `Primative`', ->
    expect(Point.create() instanceof Primative).toBe true
  
  describe 'methods', ->
  
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
    
    describe 'type', ->
    
      it 'should set a type of `point`', ->
        test = {}
        pointMethods.type.finalize.call(test)
        expect(test.type).toBe Node.types['point']
  
  describe 'implementation', ->
  
    it 'should override `toString()`', ->
      instance = Point.define().translate(30, 20).create()
      matcher = toStringHelper('Platter.geom.Point#', '({x: 30, y: 20})')
      expect(instance.toString()).toMatch matcher
    
    it 'should implement the `toRect()` interface', ->
      point = Point.define().translate(13, 20).create()
      rect = point.toRect()
      expectation = { x: 13, y: 20, width: 0, height: 0 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return