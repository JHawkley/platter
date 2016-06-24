`import Line from 'platter/geom/line'`
`import { methods as lineMethods } from 'platter/geom/line'`
`import { line as tLine } from 'platter/geom/_type'`
`import Primative from 'platter/geom/primative'`
`import { methods as nodeMethods } from 'platter/space/node'`
`import { methods as primativeMethods } from 'platter/geom/primative'`
`import Vector, { ImmutableVector } from 'platter/math/vector'`
`import q from 'platter/utils/tolerant-compare'`
`import { compareAngleDegrees as qd } from 'platter/utils/angle-compare'`
`import Rect from 'platter/math/rect'`

describe 'platter: geometry, line', ->
  
  it 'should extend `Primative`', ->
    instance = Line.define().from(13, 20).to(5, 9).create()
    expect(instance instanceof Primative).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of nodeMethods
        expect(Line.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(Line.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of lineMethods
        expect(Line.hasMethod(k, v)).toBe true
    
    describe 'from', ->
      
      it 'should provide a means to set the first point', ->
        test = {}
        lineMethods.from.apply.call(test, 8, 16)
        
        expect(test.pt1).toEqual {x: 8, y: 16}
        
        test = {}
        lineMethods.from.apply.call(test, {x: 10, y: 20})
        
        expect(test.pt1).toEqual {x: 10, y: 20}
    
    describe 'to', ->
      
      it 'should provide a means to set the second point', ->
        test = {}
        lineMethods.to.apply.call(test, 8, 16)
        
        expect(test.pt2).toEqual {x: 8, y: 16}
        
        test = {}
        lineMethods.to.apply.call(test, {x: 10, y: 20})
        
        expect(test.pt2).toEqual {x: 10, y: 20}
    
    describe 'points', ->
      
      it 'should provide a means to set both points', ->
        test = {}
        lineMethods.points.apply.call(test, 8, 16, 10, 20)
        
        expect(test.pt1).toEqual {x: 8, y: 16}
        expect(test.pt2).toEqual {x: 10, y: 20}
        
        test = {}
        lineMethods.points.apply.call(test, {x: 10, y: 20}, {x: 8, y: 16})
        
        expect(test.pt1).toEqual {x: 10, y: 20}
        expect(test.pt2).toEqual {x: 8, y: 16}
      
      it 'should convert the object literals into ImmutableVectors', ->
        test = {x: 2, y: 2, pt1: {x: 8, y: 16}, pt2: {x: 10, y: 20}}
        lineMethods.points.seal.call(test)
        
        expect(test.pt1 instanceof ImmutableVector).toBe true
        expect(test.pt2 instanceof ImmutableVector).toBe true
        
        expect(test.pt1.x).toBe 10
        expect(test.pt1.y).toBe 18
        expect(test.pt2.x).toBe 12
        expect(test.pt2.y).toBe 22
      
      it 'should fail if a point was not provided', ->
        test = {pt1: {x: 8, y: 16}}
        fn = -> lineMethods.points.finalize.call(test)
        
        expect(fn).toThrow()
        
        test = {pt2: {x: 10, y: 20}}
        fn = -> lineMethods.points.finalize.call(test)
        
        expect(fn).toThrow()
        
        test = {pt1: {x: 8, y: 16}, pt2: {}}
        fn = -> lineMethods.points.finalize.call(test)
        
        expect(fn).toThrow()
        
        test = {pt1: {}, pt2: {x: 10, y: 20}}
        fn = -> lineMethods.points.finalize.call(test)
        
        expect(fn).toThrow()
    
    describe 'normal', ->
      
      it 'should create a normal for the line', ->
        u = 0.7071067811865475
        test = {pt1: {x: 5, y: 3}, pt2: {x: 9, y: 7}}
        lineMethods.normal.finalize.call(test)
        
        expect(test.normal?).toBe true
        expect(test.normal instanceof ImmutableVector).toBe true
        
        { x: nx, y: ny } = test.normal
        
        expect(q(nx, -u)).toBe true
        expect(q(ny, u)).toBe true
      
      it 'should set the grade of the line, assuming a character moving left to right', ->
        test1 = {pt1: {x: 2, y: 1}, pt2: {x: 1, y: 0}}
        test2 = {pt1: {x: 1, y: 0}, pt2: {x: 0, y: 0}}
        test3 = {pt1: {x: 0, y: 0}, pt2: {x: -1, y: 1}}
        
        lineMethods.normal.finalize.call(test1)
        expect(qd(test1.grade * (180/Math.PI), 45)).toBe true
        
        lineMethods.normal.finalize.call(test2)
        expect(qd(test2.grade * (180/Math.PI), 0)).toBe true
        
        lineMethods.normal.finalize.call(test3)
        expect(qd(test3.grade * (180/Math.PI), -45)).toBe true
    
    describe 'rectangle', ->
      
      it 'should provide appropriate dimensions', ->
        test = {x: 0, y: 0, pt1: {x: 13, y: 20}, pt2: {x: 5, y: 9}}
        lineMethods.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 5, y: 9, width: 8, height: 11 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        lineMethods.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
    
    describe 'typeGroup', ->
    
      it 'should set a type of `circle`', ->
        test = { type: [] }
        lineMethods.typeGroup.finalize.call(test)
        
        expect(test.type).toContain tLine
  
  describe 'implementation', ->
  
    it 'should override `toString()`', ->
      instance = Line.define().from(13, 20).to(5, 9).create()
      matcher = toStringHelper('Platter.geom.Line#', '({x: 13, y: 20}, {x: 5, y: 9})')
      expect(instance.toString()).toMatch matcher
    
    it 'should implement the `support` interface', ->
      line = Line.define().from(2, 1).to(3, 4).create()
      pt = line.support(Vector.create(), Vector.create(2, -1))
      expect(pt.x).toBe 2
      expect(pt.y).toBe 1
      
      pt = line.support(Vector.create(), Vector.create(2, 2))
      expect(pt.x).toBe 3
      expect(pt.y).toBe 4
      
      pt = line.support(Vector.create(), Vector.create(3, -1))
      expect(pt.x).toBe 2.5
      expect(pt.y).toBe 2.5
    
    it 'should implement the `centerOf()` interface', ->
      line = Line.define().from(2, 1).to(3, 4).create()
      pt = line.centerOf(Vector.create())
      
      expect(pt.x).toBe 2.5
      expect(pt.y).toBe 2.5
    
    xit 'should implement the `makeProxy()` interface', ->
      line = Line.define().from(2, 1).to(3, 4).create()
      fn = -> proxy = line.makeProxy()
      
      expect(fn).not.toThrow()
    
    it 'should implement the `toRect()` interface', ->
      line = Line.define().from(13, 20).to(5, 9).create()
      rect = line.toRect(Rect.create())
      expectation = { x: 5, y: 9, width: 8, height: 11 }
      
      for k of expectation
        expect(rect[k]).toBe expectation[k]
      return
    
    it 'should be immutable', ->
      line = Line.define().from(5, 3).to(9, 7).create()
      
      props1 = ['x', 'y']
      props2 = ['point1', 'point2']
      fns = ((-> line[prop] = new ImmutableVector(0, 0)) for prop in props2)
      
      expect(fn).toThrow() for fn in fns
      for x in props2
        for y in props1
          expect(line[x][y]).not.toBe(0) 
      return
    
    it 'should have an immutable normal', ->
      line = Line.define().from(5, 3).to(9, 7).create()
      
      fn1 = -> line.normal = Vector.create(0, 1)
      fn2 = -> line.normal.setXY(1, 0)
      
      expect(fn1).toThrow()
      expect(fn2).toThrow()