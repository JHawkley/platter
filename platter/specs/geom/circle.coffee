`import Node from 'platter/space/node'`
`import Circle from 'platter/geom/circle'`
`import { methods as circleMethods } from 'platter/geom/circle'`
`import Primative from 'platter/geom/primative'`
`import { methods as primativeMethods } from 'platter/geom/primative'`

describe 'platter: geometry, circle', ->
  
  it 'should extend `Primative`', ->
    expect(Circle.define().radius(4).create() instanceof Node).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(Circle.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of circleMethods
        expect(Circle.hasMethod(k, v)).toBe true
    
    describe 'radius', ->
    
      it 'should provide a means of setting the radius', ->
        test = {}
        circleMethods.radius.apply.call(test, 8)
        
        expect(test.radius).toBe 8
    
    describe 'rectangle', ->
    
      it 'should provide appropriate dimensions', ->
        test = { x: 8, y: 16, radius: 4 }
        circleMethods.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 4, y: 12, width: 8, height: 8 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        circleMethods.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
      
      it 'should fail to provide a rectangle if radius isn\'t set', ->
        test = { x: 8, y: 16 }
        fn = -> circleMethods.rectangle.finalize.call(test)
        
        expect(fn).toThrow()
    
    describe 'type', ->
    
      it 'should set a type of `circle`', ->
        test = {}
        circleMethods.type.finalize.call(test)
        expect(test.type).toBe Node.types['circle']
  
  describe 'implementation', ->
    
    it 'should override `toString()`', ->
      instance = Circle.define().translate(13, 20).radius(5).create()
      matcher = toStringHelper('Platter.geom.Circle#', '({x: 13, y: 20, radius: 5})')
      expect(instance.toString()).toMatch matcher
    
    it 'should implement the `toRect()` interface', ->
      circle = Circle.define().translate(13, 20).radius(5).create()
      rect = circle.toRect()
      expectation = { x: 8, y: 15, width: 10, height: 10 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return
    
    it 'should be immutable', ->
      circle = Circle.define().translate(13, 20).radius(5).create()
      fn = -> circle.radius = 40
      
      expect(fn).toThrow()
      expect(circle.radius).not.toBe(40)