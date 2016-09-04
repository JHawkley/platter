`import Simplex from 'platter/math/simplex'`
`import { MutableVector as Vector } from 'platter/math/vector'`

describe 'platter: math, simplex', ->

  describe 'insantiation', ->

    simplex = null
    afterEach -> simplex = null

    it 'should initialize empty', ->
      fn = -> simplex = Simplex.create();

      expect(fn).not.toThrow()
      expect(simplex.count).toBe 0
    
    it 'should initialize with one vector', ->
      vector = Vector.create(2, 4)
      fn = -> simplex = Simplex.create(vector)

      expect(fn).not.toThrow()
      expect(simplex.count).toBe 1
      expect(vector.equalTo(simplex.a)).toBe true
  
  describe 'properties', ->
    vec1 = Vector.create(2, 4)
    vec2 = Vector.create(3, 6)
    vec3 = Vector.create(4, 8)
    vec4 = Vector.create(5, 10)
    simplex = null

    beforeEach -> simplex = Simplex.create()

    describe 'count', ->

      it 'should track how many points have been added', ->
        expect(simplex.count).toBe 0

        simplex.add(vec1)

        expect(simplex.count).toBe 1

        simplex.add(vec2)

        expect(simplex.count).toBe 2
      
      it 'should not exceed 3', ->
        expect(simplex.count).toBe 0

        simplex.add(vec1)
        simplex.add(vec2)
        simplex.add(vec3)

        expect(simplex.count).toBe 3

        simplex.add(vec4)

        expect(simplex.count).toBe 3

    describe 'point `a`', ->

      it 'should allow setting if `count` is zero or more', ->
        expect(simplex.count).toBe 0

        simplex.a = vec1
        expect(simplex.count).toBe 1
        expect(vec1.equalTo(simplex.a)).toBe true

        simplex.a = vec2
        expect(simplex.count).toBe 1
        expect(vec2.equalTo(simplex.a)).toBe true

        simplex.add(vec1)
        expect(simplex.count).toBe 2
        expect(vec1.equalTo(simplex.a)).toBe true

        simplex.a = vec2
        expect(vec2.equalTo(simplex.a)).toBe true
      
      it 'should set to the same vector instance', ->
        simplex.a = vec1
        expect(simplex.a).toBe vec1
    
    describe 'point `b`', ->

      it 'should allow setting if `count` is one or more', ->
        expect(simplex.count).toBe 0

        fn = -> simplex.b = vec1
        expect(fn).toThrow()
        expect(simplex.b).not.toEqual jasmine.anything()

        simplex.add(vec2)
        expect(simplex.count).toBe 1
        expect(fn).not.toThrow()
        expect(vec1.equalTo(simplex.b))

        simplex.add(vec3)
        expect(simplex.count).toBe 3
        expect(fn).not.toThrow()
      
      it 'should set to the same vector instance', ->
        simplex.a = vec1
        simplex.b = vec2
        expect(simplex.b).toBe vec2
    
    describe 'point `c`', ->

      it 'should allow setting if `count` is two or more', ->
        expect(simplex.count).toBe 0

        fn = -> simplex.c = vec1
        expect(fn).toThrow()
        expect(simplex.c).not.toEqual jasmine.anything()

        simplex.add(vec2)
        expect(simplex.count).toBe 1
        expect(fn).toThrow()
        expect(simplex.c).not.toEqual jasmine.anything()

        simplex.add(vec3)
        expect(simplex.count).toBe 2
        expect(fn).not.toThrow()
        expect(vec1.equalTo(simplex.c))

        simplex.add(vec4)
        expect(simplex.count).toBe 3
        expect(fn).not.toThrow()
        expect(vec1.equalTo(simplex.c))
      
      it 'should set to the same vector instance', ->
        simplex.a = vec1
        simplex.b = vec2
        simplex.c = vec3
        expect(simplex.c).toBe vec3
  
  describe 'methods', ->
    vec1 = Vector.create(2, 4)
    vec2 = Vector.create(3, 6)
    vec3 = Vector.create(4, 8)
    vec4 = Vector.create(5, 10)
    simplex = null

    beforeEach -> simplex = Simplex.create()

    describe 'clear', ->

      beforeEach -> simplex.add(vec1).add(vec2).add(vec3)

      it 'should clear out all points', ->
        expect(simplex.count).toBe 3

        simplex.clear()

        expect(simplex.count).toBe 0
        expect(simplex.a).not.toEqual jasmine.anything()

    describe 'release', ->

      beforeEach -> simplex.add(vec1).add(vec2)

      it 'should clear all vectors when released', ->
        vec = Vector.create()
        spyOn(vec, 'release')

        simplex.c = vec

        expect(vec.release).not.toHaveBeenCalled()

        simplex.release()

        expect(simplex.count).toBe 0
        expect(vec.release).toHaveBeenCalled()
    
    describe 'copy', ->

      beforeEach -> simplex.add(vec1).add(vec2)

      it 'should create a copy of the simplex', ->
        other = null
        fn = -> other = simplex.copy()

        expect(fn).not.toThrow()
        expect(other).toEqual jasmine.any(Simplex)
        expect(other).not.toBe simplex

        expect(simplex.a.equalTo(other.a)).toBe true
        expect(simplex.b.equalTo(other.b)).toBe true
        expect(other.c).not.toEqual jasmine.anything()
      
      it 'should create new vector instances for its points', ->
        other = simplex.copy()

        expect(other.a).not.toBe simplex.a
        expect(other.b).not.toBe simplex.b

    describe 'add', ->

      it 'should add a point into the `a` position, pushing others back', ->
        simplex.add(vec1)
        expect(simplex.a.equalTo(vec1)).toBe true

        simplex.add(vec2)
        expect(simplex.a.equalTo(vec2)).toBe true
        expect(simplex.b.equalTo(vec1)).toBe true
      
      it 'should push out point `c` if `count` is 3 when adding', ->
        simplex.add(vec1).add(vec2).add(vec3)
        expect(simplex.c.equalTo(vec1)).toBe true
        expect(simplex.count).toBe 3

        simplex.add(vec4)
        expect(simplex.c.equalTo(vec2)).toBe true
        expect(simplex.count).toBe 3
      
      it 'should add copies of the points given to it', ->
        simplex.add(vec1)
        expect(simplex.a.equalTo(vec1)).toBe true
        expect(simplex.a).not.toBe vec1
      
      it 'should release the point if it is pushed out', ->
        vec = Vector.create(-3, -9)
        spyOn(vec, 'release')
        simplex.a = vec
        simplex.add(vec2).add(vec3)
        expect(vec.release).not.toHaveBeenCalled()

        simplex.add(vec4)
        expect(vec.release).toHaveBeenCalled()
    
    describe 'insert', ->

      it 'should be able to insert into any existing position or the next position', ->
        simplex.add(vec1)
        expect(simplex.a.equalTo(vec1)).toBe true

        simplex.insert(vec2, 0)
        expect(simplex.a.equalTo(vec2)).toBe true

        # Next valid position.
        simplex.insert(vec3, 2)
        expect(simplex.c.equalTo(vec3)).toBe true

        simplex.insert(vec4, 1)
        expect(simplex.b.equalTo(vec4)).toBe true
      
      it 'should throw if index is out of range', ->
        # Invalid index.
        fn1 = -> simplex.insert(vec4, -1)
        # Potentially valid, but not when `count` is <= 1.
        fn2 = -> simplex.insert(vec4, 2)
        
        expect(fn1).toThrow()
        expect(fn2).toThrow()

        simplex.add(vec1).add(vec2).add(vec3)
        # Would be the next valid space, but index 3 isn't valid.
        fn3 = -> simplex.insert(vec4, 3)
        expect(fn3).toThrow()

      it 'should push out point `c` if `count` is 3 when inserting', ->
        simplex.add(vec1).add(vec2).add(vec3)
        expect(simplex.c.equalTo(vec1)).toBe true
        expect(simplex.count).toBe 3

        simplex.insert(vec4, 1)
        expect(simplex.b.equalTo(vec4)).toBe true
        expect(simplex.c.equalTo(vec2)).toBe true
        expect(simplex.count).toBe 3
      
      it 'should release the point if it is pushed out', ->
        vec = Vector.create(-3, -9)
        spyOn(vec, 'release')
        simplex.a = vec
        simplex.add(vec2).add(vec3)
        expect(vec.release).not.toHaveBeenCalled()

        simplex.insert(vec4, 1)
        expect(vec.release).toHaveBeenCalled()
    
    describe 'removeA', ->

      it 'should remove and release point `a`', ->
        vec = Vector.create(-3, -9)
        spyOn(vec, 'release')
        simplex.add(vec1).add(vec2)
        simplex.a = vec
        expect(simplex.count).toBe 2
        expect(simplex.a.equalTo(vec)).toBe true
        expect(vec.release).not.toHaveBeenCalled()

        simplex.removeA()
        expect(vec.release).toHaveBeenCalled()
        expect(simplex.a.equalTo(vec1)).toBe true
        expect(simplex.count).toBe 1
      
      it 'should do nothing if `count` is 0', ->
        fn = -> simplex.removeA()
        expect(simplex.count).toBe 0
        expect(fn).not.toThrow()
        expect(simplex.count).toBe 0
    
    describe 'removeB', ->

      it 'should remove and release point `b`', ->
        vec = Vector.create(-3, -9)
        spyOn(vec, 'release')
        simplex.add(vec1).add(vec2).add(vec3)
        simplex.b = vec
        expect(simplex.count).toBe 3
        expect(simplex.b.equalTo(vec)).toBe true
        expect(vec.release).not.toHaveBeenCalled()

        simplex.removeB()
        expect(vec.release).toHaveBeenCalled()
        expect(simplex.b.equalTo(vec1)).toBe true
        expect(simplex.count).toBe 2
      
      it 'should do nothing if `count` is <= 1', ->
        fn = -> simplex.removeB()
        simplex.add(vec1)
        expect(simplex.count).toBe 1
        expect(fn).not.toThrow()
        expect(simplex.count).toBe 1
    
    describe 'removeC', ->

      it 'should remove and release point `c`', ->
        vec = Vector.create(-3, -9)
        spyOn(vec, 'release')
        simplex.add(vec1).add(vec2).add(vec3)
        simplex.c = vec
        expect(simplex.count).toBe 3
        expect(simplex.c.equalTo(vec)).toBe true
        expect(vec.release).not.toHaveBeenCalled()

        simplex.removeC()
        expect(vec.release).toHaveBeenCalled()
        expect(simplex.c).not.toEqual jasmine.anything()
        expect(simplex.b.equalTo(vec2)).toBe true
        expect(simplex.count).toBe 2
      
      it 'should do nothing if `count` is <= 2', ->
        fn = -> simplex.removeC()
        simplex.add(vec1)
        expect(simplex.count).toBe 1
        expect(fn).not.toThrow()
        expect(simplex.count).toBe 1

        simplex.add(vec2)
        expect(simplex.count).toBe 2
        expect(fn).not.toThrow()
        expect(simplex.count).toBe 2