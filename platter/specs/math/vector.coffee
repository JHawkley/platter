`import { MutableVector, ImmutableVector, SimpleVector } from 'platter/math/vector'`
`import q from 'platter/utils/tolerant-compare'`

toDegrees = (r) -> r * (180/Math.PI)
toRadians = (d) -> d * (Math.PI/180)

describe 'platter: math, mutable vector', ->
  
  it 'should override `toString()`', ->
    str = 'Platter.math.MutableVector({x: 30, y: 20})'
    expect(new MutableVector(30, 20).toString()).toBe str
  
  describe 'properties', ->
    vector = null
    
    beforeEach -> vector = MutableVector.create(4, 4)
    afterEach -> vector.release()
  
    it 'should update related properties when `x` is set', ->
      len1 = 5.656854249492381
      ang1 = 45
      len2 = 4
      ang2 = 0
      
      expect(q(vector.length, len1)).toBe true
      expect(q(toDegrees(vector.angle), ang1)).toBe true
      
      vector.x = 0
      
      expect(q(vector.length, len2)).toBe true
      expect(q(toDegrees(vector.angle), ang2)).toBe true
      expect(vector.x).toBe 0
      
    it 'should update related properties when `y` is set', ->
      len1 = 5.656854249492381
      ang1 = 45
      len2 = 4
      ang2 = 90
      
      expect(q(vector.length, len1)).toBe true
      expect(q(toDegrees(vector.angle), ang1)).toBe true
      
      vector.y = 0
      
      expect(q(vector.length, len2)).toBe true
      expect(q(toDegrees(vector.angle), ang2)).toBe true
      expect(vector.y).toBe 0
    
    it 'should update related properties when `length` is set', ->
      len1 = 5.656854249492381
      len2 = 11.313708498984761
      
      expect(q(vector.length, len1)).toBe true
      expect(vector.x).toBe 4
      expect(vector.y).toBe 4
      
      vector.length *= 2
      
      expect(q(vector.x, 8)).toBe true
      expect(q(vector.y, 8)).toBe true
      expect(q(vector.length, len2)).toBe true
    
    it 'should update related properties when `angle` is set', ->
      expect(vector.x).toBe 4
      expect(vector.y).toBe 4
      
      vector.angle = 0
      
      expect(q(vector.x, 0)).toBe true
      expect(q(vector.y, 5.656854249492381)).toBe true
  
  describe 'operators', ->
    vec1 = null
    vec2 = null
    
    beforeEach -> vec1 = MutableVector.create(4, 4)
    afterEach ->
      vec1.release()
      vec2.release()
  
    it 'should be able to add', ->
      op = { x: 1, y: 3 }
      
      vec2 = vec1.add(op)
      
      expect(vec2).not.toBe vec1
      expect(vec2.x).toBe 5
      expect(vec2.y).toBe 7
      
      vec1.addEq(op)
      
      expect(vec1.x).toBe 5
      expect(vec1.y).toBe 7
    
    it 'should be able subtract', ->
      op = { x: 1, y: 3 }
      
      vec2 = vec1.sub(op)
      
      expect(vec2).not.toBe vec1
      expect(vec2.x).toBe 3
      expect(vec2.y).toBe 1
      
      vec1.subEq(op)
      
      expect(vec1.x).toBe 3
      expect(vec1.y).toBe 1
    
    it 'should be able to scale (multiply)', ->
      vec2 = vec1.mul(2.5)
      
      expect(vec2).not.toBe vec1
      expect(vec2.x).toBe 10
      expect(vec2.y).toBe 10
      
      vec1.mulEq(2.5)
      
      expect(vec1.x).toBe 10
      expect(vec1.y).toBe 10
    
    it 'should be able to rotate', ->
      vec2 = vec1.rotate(toRadians(90))
      
      expect(vec2).not.toBe vec1
      expect(q(vec2.x, 4)).toBe true
      expect(q(vec2.y, -4)).toBe true
      
      vec1.rotateSelf(toRadians(90))
      
      expect(q(vec1.x, 4)).toBe true
      expect(q(vec1.y, -4)).toBe true
    
    it 'should be able to normalize', ->
      u = 0.7071067811865475
      vec2 = vec1.unit()
      
      expect(vec2).not.toBe vec1
      expect(q(vec2.x, u)).toBe true
      expect(q(vec2.y, u)).toBe true
      
      vec1.length = 1
      
      expect(q(vec1.x, u)).toBe true
      expect(q(vec1.y, u)).toBe true

describe 'platter: math, immutable vector', ->
  
  it 'should override `toString()`', ->
    str = 'Platter.math.ImmutableVector({x: 30, y: 20})'
    expect(new ImmutableVector(30, 20).toString()).toBe str
  
  it 'should have immutable properties', ->
    vector = new ImmutableVector(30, 20)
    props = ['x', 'y', 'length', 'angle']
    
    fns = ((-> vector[prop] = 1) for prop in props)
    
    expect(fn).toThrow() for fn in fns
    return
  
  it 'should not mutate by self-equals operators', ->
    vector = new ImmutableVector(30, 20)
    op = { x: 4, y: 2 }
    
    fns = [
      -> vector.addEq(op)
      -> vector.subEq(op)
      -> vector.mulEq(2)
      -> vector.set(op)
      -> vector.setXY(4, 2)
      -> vector.rotateSelf(90)
    ]
    
    expect(fn).toThrow() for fn in fns
    expect(vector.x).toBe 30
    expect(vector.y).toBe 20

describe 'platter: math, simple vector', ->
  
  it 'should override `toString()`', ->
    str = 'Platter.math.SimpleVector({x: 30, y: 20})'
    expect(new SimpleVector(30, 20).toString()).toBe str
  
  it 'should have immutable properties', ->
    vector = new SimpleVector(30, 20)
    props = ['x', 'y']
    
    fns = ((-> vector[prop] = 1) for prop in props)
    
    expect(fn).toThrow() for fn in fns
    return