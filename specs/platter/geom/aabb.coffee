`import AABB, { Methods as methAABB, Type as tAABB } from 'platter/geom/aabb'`
`import { Primative } from 'platter/geom/primative'`
`import { Methods as methNode } from 'platter/space/node'`
`import { Methods as methPrimative } from 'platter/geom/primative'`
`import { MutableVector as Vector } from 'platter/math/vector'`
`import Rect from 'platter/math/rect'`

describe 'platter: geometry, axis-aligned bounding-box', ->
  
  it 'should extend `Primative`', ->
    instance = AABB.define().dimensions(20, 30).create()
    expect(instance instanceof Primative).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of methNode
        expect(AABB.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Primative', ->
      for k, v of methPrimative
        expect(AABB.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of methAABB
        expect(AABB.hasMethod(k, v)).toBe true
    
    describe 'dimensions', ->
      
      it 'should provide a means to set the dimensions', ->
        test = {}
        methAABB.dimensions.apply.call(test, 8, 16)
        
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
        
        fns = (-> methAABB.dimensions.finalize.call(test) for test in tests)
        
        expect(fn).toThrow for fn in fns
        
        fn = -> methAABB.dimensions.finalize.call(control)
        
        expect(fn).not.toThrow()
    
    describe 'width', ->
      
      it 'should provide a means to set the width', ->
        test = {}
        methAABB.width.apply.call(test, 8)
        
        expect(test.width).toBe 8
    
    describe 'height', ->
      
      it 'should provide a means to set the height', ->
        test = {}
        methAABB.height.apply.call(test, 16)
        
        expect(test.height).toBe 16
    
    describe 'setType', ->
    
      it 'should set a type of `aabb`', ->
        test = { type: [] }
        methAABB.setType.finalize.call(test)
        
        expect(test.type).toContain tAABB
  
  describe 'implementation', ->

    xit 'should implement the `proxy` interface', ->
      aabb = AABB.define().translate(13, 20).dimensions(5, 9).create()
      proxy = aabb.proxy
      
      expect(proxy).toEqual jasmine.anything()
    
    it 'should implement the `support()` interface', ->
      x = 13; y = 20
      width = 5; height = 9
      hWidth = width / 2
      hHeight = height / 2
      
      aabb = AABB.define().translate(x, y).dimensions(width, height).create()
      
      testVectors = [
        Vector.create(0, -1)  # N
        Vector.create(1, -1)  # NE
        Vector.create(1, 0)   # E
        Vector.create(1, 1)   # SE
        Vector.create(0, 1)   # S
        Vector.create(-1, 1)   # SW
        Vector.create(-1, 0)   # W
        Vector.create(-1, -1)   # NW
      ].map (v) -> v.mulEq(0.2)
      
      expectations = [
        { x: x + hWidth, y }
        { x: x + width, y: y }
        { x: x + width, y: y + hHeight }
        { x: x + width, y: y + height }
        { x: x + hWidth, y: y + height }
        { x, y: y + height }
        { x, y: y + hHeight }
        { x, y }
      ]
      
      for v, i in testVectors
        pt = aabb.support(Vector.create(), v)
        expect(pt.x).toBe expectations[i].x
        expect(pt.y).toBe expectations[i].y
    
    it 'should implement the `centerOf()` interface', ->
      aabb = AABB.define().translate(13, 20).dimensions(5, 9).create()
      pt = aabb.centerOf(Vector.create())
      
      expect(pt.x).toBe 15.5
      expect(pt.y).toBe 24.5
    
    it 'should implement the `toRect()` interface', ->
      aabb = AABB.define().translate(13, 20).dimensions(5, 9).create()
      rect = aabb.toRect(Rect.create())
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