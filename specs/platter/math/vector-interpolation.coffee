`import VectorInterpolation from 'platter/math/vector-interpolation'`
`import { MutableVector as Vector } from 'platter/math/vector'`
`import q from 'platter/utils/tolerant-compare'`

vEquals = (a, b) -> q(a.x, b.x) and q(a.y, b.y)

describe 'platter: math, vector interpolation', ->
  
  interp = null
  beforeEach -> interp = new VectorInterpolation()
  
  describe 'node management', ->
    
    it 'should initialize empty', ->
      expect(interp._nodes.length).toBe 0
    
    describe 'add()', ->
      
      it 'should add nodes at a default position of 1.0', ->
        v = Vector.create(2, 5)
        interp.add(v)
        
        expect(interp._nodes.length).toBe 1
        expect(interp._nodes[0].pos).toBe 1.0
        expect(vEquals(interp._nodes[0].value, v)).toBe true
      
      it 'should add nodes at a specified position', ->
        v = Vector.create(2, 5)
        interp.add(v, 0.5)
        
        expect(interp._nodes.length).toBe 1
        expect(interp._nodes[0].pos).toBe 0.5
        expect(vEquals(interp._nodes[0].value, v)).toBe true
      
      it 'should throw if position is not between 0 and 1 (inclusive)', ->
        fn1 = -> interp.add(Vector.create(2, 5), -0.1)
        fn2 = -> interp.add(Vector.create(2, 5), 1.1)
        
        expect(fn1).toThrow()
        expect(fn2).toThrow()
      
      it 'should sort nodes by position as they are added', ->
        v1 = Vector.create(2, 5)
        v2 = Vector.create(4, 10)
        v3 = Vector.create(8, 20)
        
        interp.add(v1, 1.0)
        interp.add(v2, 0.6)
        interp.add(v3, 0.3)
        
        expect(vEquals(interp._nodes[0].value, v3)).toBe true
        expect(vEquals(interp._nodes[1].value, v2)).toBe true
        expect(vEquals(interp._nodes[2].value, v1)).toBe true
    
    describe 'clear()', ->
      
      it 'should be able to clear all nodes', ->
        v1 = Vector.create(2, 5)
        v2 = Vector.create(4, 10)
        v3 = Vector.create(8, 20)
        
        interp.add(v1, 1.0)
        interp.add(v2, 0.6)
        interp.add(v3, 0.3)
        
        expect(interp._nodes.length).toBe 3
        
        interp.clear()
        
        expect(interp._nodes.length).toBe 0
    
    describe 'set()', ->
      
      it 'should clear and then add a node at position 1.0', ->
        v1 = Vector.create(2, 5)
        v2 = Vector.create(4, 10)
        v3 = Vector.create(8, 20)
        v4 = Vector.create(6, 6)
        
        interp.add(v1, 1.0)
        interp.add(v2, 0.6)
        interp.add(v3, 0.3)
        
        expect(interp._nodes.length).toBe 3
        
        interp.set(v4)
        
        expect(interp._nodes.length).toBe 1
        expect(interp._nodes[0].pos).toBe 1.0
        expect(vEquals(interp._nodes[0].value, v4)).toBe true
    
    describe 'divert()', ->
      
      it 'should retain the value at a certain position, after setting 1.0 to a new value', ->
        v1 = Vector.create(2, 5)
        v2 = Vector.create(4, 10)
        v3 = Vector.create(8, 20)
        v4 = Vector.create(6, 6)
        
        interp.add(v1, 1.0)
        interp.add(v2, 0.6)
        interp.add(v3, 0.3)
        
        val = interp.valueAt(Vector.create(), 0.6)
        expect(vEquals(val, v2)).toBe true
        
        interp.divert(0.6, v4)
        
        expect(interp._nodes.length).toBe 2
        expect(vEquals(interp.valueAt(Vector.create(), 0.6), val)).toBe true
        expect(vEquals(interp.valueAt(Vector.create(), 1.0), v4)).toBe true
      
      it 'should just work like `set()` if `pos` is 1.0', ->
        v1 = Vector.create(2, 5)
        v2 = Vector.create(4, 10)
        v3 = Vector.create(8, 20)
        v4 = Vector.create(6, 6)
        
        interp.add(v1, 1.0)
        interp.add(v2, 0.6)
        interp.add(v3, 0.3)
        
        interp.divert(1.0, v4)
        
        expect(interp._nodes.length).toBe 1
        expect(vEquals(interp.valueAt(Vector.create(), 1.0), v4)).toBe true
  
  describe 'value interpolation', ->
    
    beforeEach ->
      interp.add(Vector.create(2, 5), 0.3)
      interp.add(Vector.create(8, 20), 0.6)
      interp.add(Vector.create(4, 10), 0.9)
    
    it 'should set to a zero vector at position 0.0', ->
      v = interp.valueAt(Vector.create(), 0.0)
      
      expect(v.x).toBe 0
      expect(v.y).toBe 0
    
    it 'should set to the first value, if that value is at 0.0, at position 0.0', ->
      interp.add(Vector.create(6, 6), 0.0)
      
      v = interp.valueAt(Vector.create(), 0.0)
      
      expect(v.x).toBe 6
      expect(v.y).toBe 6
    
    it 'should set to the last value at position 1.0', ->
      v = interp.valueAt(Vector.create(), 1.0)
      
      expect(v.x).toBe 4
      expect(v.y).toBe 10
    
    it 'should interpolate based on position', ->
      v = interp.valueAt(Vector.create(), 0.15)
      
      expect(q(v.x, 1)).toBe true
      expect(q(v.y, 2.5)).toBe true
      
      v = interp.valueAt(Vector.create(), 0.45)
      
      expect(q(v.x, 5)).toBe true
      expect(q(v.y, 12.5)).toBe true
      
      v = interp.valueAt(Vector.create(), 0.75)
      
      expect(q(v.x, 6)).toBe true
      expect(q(v.y, 15)).toBe true
    
    it 'should not divide by zero if two nodes have the same position', ->
      # This behavior is otherwise undefined. value returned depends on sorting.
      # If sort was unstable, who knows which of the values is returned.
      interp.add(Vector.create(6, 6), 0.6)
      
      fn = -> interp.valueAt(Vector.create(), 0.6)
      
      expect(fn).not.toThrow()