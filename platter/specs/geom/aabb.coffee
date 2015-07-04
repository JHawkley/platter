`import Node from 'platter/space/node'`
`import AABB from 'platter/geom/aabb'`
`import { methods as aabbMethods } from 'platter/geom/aabb'`
`import Primative from 'platter/geom/primative'`
`import { methods as primativeMethods } from 'platter/geom/primative'`

describe 'platter: geometry, axis-aligned bounding-box', ->
  
  it 'should extend `Primative`', ->
    instance = AABB.define().dimensions(20, 30).create()
    expect(instance instanceof Primative).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(AABB.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of aabbMethods
        expect(AABB.hasMethod(k, v)).toBe true
    
    describe 'dimensions', ->
      
      it 'should provide a means to set the dimensions', ->
        test = {}
        aabbMethods.dimensions.apply.call(test, 8, 16)
        
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
        
        fns = (-> aabbMethods.dimensions.finalize.call(test) for test in tests)
        
        expect(fn).toThrow for fn in fns
        
        fn = -> aabbMethods.dimensions.finalize.call(control)
        
        expect(fn).not.toThrow()
    
    describe 'width', ->
      
      it 'should provide a means to set the width', ->
        test = {}
        aabbMethods.width.apply.call(test, 8)
        
        expect(test.width).toBe 8
    
    describe 'height', ->
      
      it 'should provide a means to set the height', ->
        test = {}
        aabbMethods.height.apply.call(test, 16)
        
        expect(test.height).toBe 16
    
    describe 'type', ->
    
      it 'should set a type of `aabb`', ->
        test = {}
        aabbMethods.type.finalize.call(test)
        expect(test.type).toBe Node.types['aabb']
  
  describe 'implementation', ->
  
    it 'should override `toString()`', ->
      instance = AABB.define().translate(8, 16).dimensions(20, 30).create()
      matcher = toStringHelper('Platter.geom.AABB#', '({x: 8, y: 16, width: 20, height: 30})')
      expect(instance.toString()).toMatch matcher
    
    it 'should implement the `toRect()` interface', ->
      aabb = AABB.define().translate(13, 20).dimensions(5, 9).create()
      rect = aabb.toRect()
      expectation = { x: 13, y: 20, width: 5, height: 9 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return
    
    it 'should be immutable', ->
      aabb = AABB.define().translate(8, 16).dimensions(20, 30).create()
      props = ['width', 'height']
      fns = ((-> aabb[prop] = 0) for prop in props)
      
      expect(fn).toThrow() for fn in fns
      expect(aabb[prop]).not.toBe(0) for prop in props
      return